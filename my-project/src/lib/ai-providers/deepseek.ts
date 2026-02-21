import OpenAI from 'openai';
import { AIProvider, TranscriptionResult, TaskExtractionResult } from './types';

// DeepSeek is compatible with OpenAI API
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export class DeepSeekProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'deepseek-chat') {
    this.client = new OpenAI({
      apiKey,
      baseURL: DEEPSEEK_BASE_URL,
    });
    this.model = model;
  }

  async transcribe(audioBase64: string): Promise<TranscriptionResult> {
    // DeepSeek doesn't have a native transcription API like Whisper
    // We'll return an error indicating this limitation
    throw new Error(
      'DeepSeek does not support audio transcription. ' +
      'Please use OpenAI, Groq, or Ollama with Whisper for transcription, ' +
      'or manually input your text.'
    );
  }

  async extractTasks(transcription: string, language: string): Promise<TaskExtractionResult> {
    const systemPrompt = this.getSystemPrompt(language);
    const userPrompt = this.getUserPrompt(language, transcription);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      const parsed = JSON.parse(content);
      return { tasks: parsed.tasks || [] };
    } catch {
      // Fallback: create single task from transcription
      return {
        tasks: [{
          title: transcription.slice(0, 100),
          description: transcription,
          priority: 'MEDIUM',
        }],
      };
    }
  }

  private getSystemPrompt(language: string): string {
    const prompts: Record<string, string> = {
      es: `Eres un asistente experto en gestión de tareas. Analiza textos y conviértelos en tareas accionables.

Reglas:
1. Identifica todas las tareas mencionadas
2. Divide en tareas separadas si hay múltiples
3. Infiere prioridad: urgente, importante, crítico → HIGH/URGENT
4. Extrae fechas límite si se mencionan
5. Responde SOLO con JSON válido

Formato:
{"tasks": [{"title": "título", "description": "descripción", "priority": "LOW|MEDIUM|HIGH|URGENT", "dueDate": "YYYY-MM-DD o null", "tags": []}]}`,

      en: `You are an expert task management assistant. Analyze texts and convert them into actionable tasks.

Rules:
1. Identify all tasks mentioned
2. Split into separate tasks if multiple
3. Infer priority: urgent, important, critical → HIGH/URGENT
4. Extract deadlines if mentioned
5. Respond ONLY with valid JSON

Format:
{"tasks": [{"title": "title", "description": "description", "priority": "LOW|MEDIUM|HIGH|URGENT", "dueDate": "YYYY-MM-DD or null", "tags": []}]}`,

      zh: `你是一位任务管理专家。分析文本并将其转换为可执行的任务。

规则：
1. 识别所有提到的任务
2. 如果有多个，分成单独的任务
3. 推断优先级：紧急、重要、关键 → HIGH/URGENT
4. 提取截止日期
5. 只用有效的JSON回复

格式：
{"tasks": [{"title": "标题", "description": "描述", "priority": "LOW|MEDIUM|HIGH|URGENT", "dueDate": "YYYY-MM-DD 或 null", "tags": []}]}`,
    };

    return prompts[language] || prompts.en;
  }

  private getUserPrompt(language: string, transcription: string): string {
    const prompts: Record<string, string> = {
      es: `Analiza este texto y extrae las tareas:\n\n"${transcription}"`,
      en: `Analyze this text and extract tasks:\n\n"${transcription}"`,
      zh: `分析此文本并提取任务：\n\n"${transcription}"`,
    };

    return prompts[language] || prompts.en;
  }
}
