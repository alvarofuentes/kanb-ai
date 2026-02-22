import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TaskPriority } from '@prisma/client';
import { createChatProvider, hasAIProvider, PROVIDER_CONFIGS } from '@/lib/ai-providers';
import { ExtractedTask } from '@/lib/ai-providers/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const extractTasksSchema = z.object({
  transcription: z.string()
    .min(1, "Transcription is required")
    .max(10000, "Transcription is too long. Max 10,000 characters supported."),
  language: z.string().max(10).optional(),
  saveToDb: z.boolean().optional(),
});

// POST - Extract tasks from transcription using AI
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as any).id;

    // Check if AI provider is configured
    if (!hasAIProvider()) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI provider not configured',
          errorType: 'MISSING_API_KEY',
          hint: 'Please configure at least one AI provider in your .env file',
          providers: {
            openai: {
              name: 'OpenAI',
              envVar: 'OPENAI_API_KEY',
              signupUrl: 'https://platform.openai.com/api-keys',
            },
            groq: {
              name: 'Groq',
              envVar: 'GROQ_API_KEY',
              signupUrl: 'https://console.groq.com/keys',
              free: true,
            },
            deepseek: {
              name: 'DeepSeek',
              envVar: 'DEEPSEEK_API_KEY',
              signupUrl: 'https://platform.deepseek.com/api_keys',
            },
            ollama: {
              name: 'Ollama (Local)',
              envVar: 'OLLAMA_ENABLED',
              signupUrl: 'https://ollama.ai',
              free: true,
              local: true,
            },
          },
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate payload limits
    const parsedData = extractTasksSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Validation Error', details: parsedData.error.format() },
        { status: 400 }
      );
    }

    // use sessionUserId instead of passed userId to ensure secure task creation
    const { transcription, language, saveToDb } = parsedData.data;
    const userId = sessionUserId;

    // Create chat provider (for task extraction)
    const result = createChatProvider();

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to initialize AI provider',
          hint: 'Make sure you have at least one AI provider configured',
        },
        { status: 500 }
      );
    }

    const { provider, type } = result;

    // Extract tasks with retry logic
    let extractionResult;
    let retries = 3;
    let lastError: Error | null = null;

    while (retries > 0) {
      try {
        extractionResult = await provider.extractTasks(transcription, language || 'en');
        break;
      } catch (err) {
        lastError = err as Error;
        retries--;
        console.log(`Task extraction attempt ${4 - retries} failed:`, lastError.message);
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        }
      }
    }

    if (!extractionResult) {
      console.error('Task extraction failed after retries:', lastError);

      // Provide helpful error messages
      let errorMessage = lastError?.message || 'Task extraction failed';
      let hint = '';

      if (lastError?.message?.includes('Country, region, or territory not supported')) {
        errorMessage = 'Provider is not available in your region';
        hint = 'Try using DeepSeek or Ollama instead';
      } else if (lastError?.message?.includes('model') || lastError?.message?.includes('not found')) {
        if (type === 'ollama') {
          hint = 'Run: ollama pull llama3.2 (or your preferred model)';
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          hint,
          provider: type,
        },
        { status: 500 }
      );
    }

    const extractedTasks: ExtractedTask[] = extractionResult.tasks;

    // Validate extracted tasks
    if (extractedTasks.length === 0) {
      // Create a fallback task
      extractedTasks.push({
        title: transcription.slice(0, 100),
        description: transcription,
        priority: 'MEDIUM',
      });
    }

    // If saveToDb is true, save the tasks to the database
    const savedTasks: import('@prisma/client').Task[] = [];
    if (saveToDb && extractedTasks.length > 0) {
      for (const task of extractedTasks) {
        try {
          const savedTask = await db.task.create({
            data: {
              title: task.title || transcription.slice(0, 100),
              description: task.description || transcription,
              priority: (task.priority || 'MEDIUM') as TaskPriority,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              tags: task.tags ? JSON.stringify(task.tags) : null,
              userId: userId || 'default-user',
            },
          });
          savedTasks.push(savedTask);
        } catch (dbError) {
          console.error('Error saving task:', dbError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      tasks: saveToDb ? savedTasks : extractedTasks,
      count: extractedTasks.length,
      provider: type,
      providerName: PROVIDER_CONFIGS[type]?.name || type,
    });
  } catch (error) {
    console.error('Error extracting tasks:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract tasks';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
