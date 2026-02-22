import { NextRequest, NextResponse } from 'next/server';
import {
  createTranscriptionProvider,
  hasTranscriptionProvider,
  getTranscriptionProviderType,
  hasChatProvider,
  getChatProviderType,
  getConfiguredProviders,
  PROVIDER_CONFIGS
} from '@/lib/ai-providers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Approx 5MB of audio results in ~7MB base64 string. We limit to 7MB base64.
const transcribeSchema = z.object({
  audioBase64: z.string()
    .min(100, "Audio data is too short")
    .max(7 * 1024 * 1024, "Audio file is too large (max ~5MB)"),
  language: z.string().max(10).optional(),
});

// POST - Transcribe audio to text
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if transcription provider is configured
    if (!hasTranscriptionProvider()) {
      return NextResponse.json(
        {
          success: false,
          error: 'No transcription provider configured',
          errorType: 'MISSING_API_KEY',
          hint: 'Please configure a provider that supports transcription (OpenAI, Groq, Whisper.cpp, or Ollama)',
          providers: {
            openai: {
              name: 'OpenAI',
              envVar: 'OPENAI_API_KEY',
              signupUrl: 'https://platform.openai.com/api-keys',
              supportsTranscription: true,
            },
            groq: {
              name: 'Groq',
              envVar: 'GROQ_API_KEY',
              signupUrl: 'https://console.groq.com/keys',
              supportsTranscription: true,
              free: true,
            },
            whisperCpp: {
              name: 'Whisper.cpp (Local)',
              envVar: 'WHISPER_CPP_ENABLED',
              signupUrl: 'https://github.com/ggerganov/whisper.cpp',
              supportsTranscription: true,
              free: true,
              local: true,
              hint: 'Set WHISPER_CPP_ENABLED=true',
            },
            ollama: {
              name: 'Ollama (Local)',
              envVar: 'OLLAMA_ENABLED',
              signupUrl: 'https://ollama.ai',
              supportsTranscription: true,
              free: true,
              local: true,
              hint: 'Set OLLAMA_ENABLED=true and run: ollama pull whisper',
            },
          },
          note: 'DeepSeek does not support audio transcription',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsedData = transcribeSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Validation Error', details: parsedData.error.format() },
        { status: 400 }
      );
    }

    const { audioBase64, language } = parsedData.data;

    // Create transcription provider
    const result = createTranscriptionProvider();

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to initialize transcription provider',
          hint: 'Make sure you have OpenAI, Groq, Whisper.cpp, or Ollama configured',
        },
        { status: 500 }
      );
    }

    const { provider, type } = result;

    // Transcribe the audio with retry logic
    let transcriptionResult;
    let retries = 3;
    let lastError: Error | null = null;

    while (retries > 0) {
      try {
        transcriptionResult = await provider.transcribe(audioBase64, language);
        break;
      } catch (err) {
        lastError = err as Error;
        retries--;
        console.log(`Transcription attempt ${4 - retries} failed:`, lastError.message);
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        }
      }
    }

    if (!transcriptionResult) {
      console.error('Transcription failed after retries:', lastError);

      // Provide helpful error messages
      let errorMessage = lastError?.message || 'Transcription failed';
      let hint = '';

      if (lastError?.message?.includes('Country, region, or territory not supported')) {
        errorMessage = 'Provider is not available in your region';
        hint = 'Try using Whisper.cpp (local) or Ollama instead';
      } else if (lastError?.message?.includes('whisper') || lastError?.message?.includes('model')) {
        if (type === 'ollama') {
          hint = 'Run: ollama pull whisper';
        } else if (type === 'whisper-cpp') {
          hint = 'Make sure whisper-cli is installed and models are downloaded';
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

    return NextResponse.json({
      success: true,
      transcription: transcriptionResult.text,
      language: transcriptionResult.language,
      wordCount: transcriptionResult.text.split(/\s+/).filter(Boolean).length,
      provider: type,
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to transcribe audio';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Check AI provider status
export async function GET() {
  const hasTranscription = hasTranscriptionProvider();
  const transcriptionProvider = getTranscriptionProviderType();
  const hasChat = hasChatProvider();
  const chatProvider = getChatProviderType();
  const configuredProviders = getConfiguredProviders();

  return NextResponse.json({
    configured: hasTranscription,
    provider: transcriptionProvider,
    // Chat provider info
    chatConfigured: hasChat,
    chatProvider: chatProvider,
    // All configured providers
    allConfigured: configuredProviders,
    providers: configuredProviders.map(p => ({
      type: p,
      ...PROVIDER_CONFIGS[p],
    })),
    hint: hasTranscription && hasChat
      ? undefined
      : 'Configure at least one transcription provider and one chat provider',
  });
}
