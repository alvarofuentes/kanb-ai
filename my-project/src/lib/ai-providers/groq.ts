import Groq from 'groq-sdk';
import { AIProvider, TranscriptionResult, TaskExtractionResult } from './types';

export class GroqProvider implements AIProvider {
  private client: Groq;
  private model: string;

  constructor(apiKey: string, model: string = 'llama-3.3-70b-versatile') {
    this.client = new Groq({
      apiKey,
    });
    this.model = model;
  }

  async transcribe(audioBase64: string): Promise<TranscriptionResult> {
    // Convert base64 to buffer
    const buffer = Buffer.from(audioBase64, 'base64');
    
    // Create a File-like object for Groq
    const file = new File([buffer], 'audio.webm', { type: 'audio/webm' });

    // Groq uses whisper-large-v3-turbo for transcription (free!)
    const response = await this.client.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3-turbo',
      response_format: 'json',
    });

    const text = response.text;
    const language = this.detectLanguage(text);

    return { text, language };
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
      temperature: 0.3,
      max_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { tasks: parsed.tasks || [] };
      }
      return { tasks: [] };
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

  private detectLanguage(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Chinese detection
    const chineseRegex = /[\u4e00-\u9fff]/;
    if (chineseRegex.test(text)) return 'zh';
    
    // Spanish common words
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'ser', 'se', 'no', 'tarea', 'necesito', 'mañana', 'hoy', 'importante'];
    
    // English common words
    const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'task', 'need', 'tomorrow', 'today', 'important'];
    
    const words = lowerText.split(/\s+/);
    let spanishCount = 0;
    let englishCount = 0;
    
    for (const word of words) {
      const clean = word.replace(/[^\w]/g, '');
      if (spanishWords.includes(clean)) spanishCount++;
      if (englishWords.includes(clean)) englishCount++;
    }
    
    if (spanishCount > englishCount) return 'es';
    return 'en';
  }

  private getSystemPrompt(language: string): string {
    const prompts: Record<string, string> = {
      es: `Eres un asistente experto en gestión de tareas. Analiza transcripciones y conviértelas en tareas accionables.

Reglas:
1. Identifica todas las tareas mencionadas
2. Divide en tareas separadas si hay múltiples
3. Infiere prioridad: urgente, importante, crítico → HIGH/URGENT
4. Extrae fechas límite si se mencionan
5. Responde SOLO con JSON válido

Formato:
{"tasks": [{"title": "título", "description": "descripción", "priority": "LOW|MEDIUM|HIGH|URGENT", "dueDate": "YYYY-MM-DD o null", "tags": []}]}`,

      en: `You are an expert task management assistant. Analyze transcriptions and convert them into actionable tasks.

Rules:
1. Identify all tasks mentioned
2. Split into separate tasks if multiple
3. Infer priority: urgent, important, critical → HIGH/URGENT
4. Extract deadlines if mentioned
5. Respond ONLY with valid JSON

Format:
{"tasks": [{"title": "title", "description": "description", "priority": "LOW|MEDIUM|HIGH|URGENT", "dueDate": "YYYY-MM-DD or null", "tags": []}]}`,

      zh: `你是一位任务管理专家。分析转录并将其转换为可执行的任务。

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
      es: `Analiza esta transcripción y extrae las tareas:\n\n"${transcription}"`,
      en: `Analyze this transcription and extract tasks:\n\n"${transcription}"`,
      zh: `分析此转录并提取任务：\n\n"${transcription}"`,
    };

    return prompts[language] || prompts.en;
  }
}
