import OpenAI from 'openai';
import { AIProvider, TranscriptionResult, TaskExtractionResult } from './types';

// Ollama default local URL - can be changed for cloud Ollama instances
const OLLAMA_DEFAULT_URL = 'http://localhost:11434/v1';

export class OllamaProvider implements AIProvider {
  private client: OpenAI;
  private chatModel: string;
  private whisperModel: string;
  private baseUrl: string;

  constructor(
    baseUrl: string = OLLAMA_DEFAULT_URL,
    chatModel: string = 'llama3.2',
    whisperModel: string = 'whisper'
  ) {
    this.baseUrl = baseUrl;
    this.chatModel = chatModel;
    this.whisperModel = whisperModel;
    
    // Ollama is compatible with OpenAI API
    // No API key needed for local Ollama
    this.client = new OpenAI({
      apiKey: 'ollama', // Ollama doesn't need a real API key, but the client requires one
      baseURL: baseUrl,
    });
  }

  async transcribe(audioBase64: string): Promise<TranscriptionResult> {
    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(audioBase64, 'base64');
      
      // Create a File-like object
      const file = new File([buffer], 'audio.webm', { type: 'audio/webm' });

      // Try to use Ollama's whisper model if available
      const response = await this.client.audio.transcriptions.create({
        file: file,
        model: this.whisperModel,
        response_format: 'json' as any,
      });

      const text = response.text;
      const language = this.detectLanguage(text);

      return { text, language };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if it's a model not found error
      if (errorMessage.includes('not found') || errorMessage.includes('model')) {
        throw new Error(
          `Whisper model not found in Ollama. Install it with: ollama pull ${this.whisperModel}\n` +
          `Or use manual text input instead of voice recording.`
        );
      }
      
      throw new Error(
        `Ollama transcription failed: ${errorMessage}\n` +
        `Make sure Ollama is running (${this.baseUrl}) and whisper model is installed.`
      );
    }
  }

  async extractTasks(transcription: string, language: string): Promise<TaskExtractionResult> {
    const systemPrompt = this.getSystemPrompt(language);
    const userPrompt = this.getUserPrompt(language, transcription);

    try {
      const response = await this.client.chat.completions.create({
        model: this.chatModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '{}';
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      
      try {
        const parsed = JSON.parse(jsonStr);
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found') || errorMessage.includes('model')) {
        throw new Error(
          `Chat model '${this.chatModel}' not found in Ollama. Install it with: ollama pull ${this.chatModel}\n` +
          `Available models: Run 'ollama list' to see installed models.`
        );
      }
      
      throw new Error(
        `Ollama task extraction failed: ${errorMessage}\n` +
        `Make sure Ollama is running (${this.baseUrl}).`
      );
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
      es: `Eres un asistente experto en gestión de tareas. Analiza textos y conviértelos en tareas accionables.

Reglas:
1. Identifica todas las tareas mencionadas
2. Divide en tareas separadas si hay múltiples
3. Infiere prioridad: urgente, importante, crítico → HIGH/URGENT
4. Extrae fechas límite si se mencionan
5. Responde SOLO con JSON válido, sin markdown ni explicaciones

Formato de respuesta:
{"tasks": [{"title": "título", "description": "descripción", "priority": "LOW|MEDIUM|HIGH|URGENT", "dueDate": "YYYY-MM-DD o null", "tags": []}]}`,

      en: `You are an expert task management assistant. Analyze texts and convert them into actionable tasks.

Rules:
1. Identify all tasks mentioned
2. Split into separate tasks if multiple
3. Infer priority: urgent, important, critical → HIGH/URGENT
4. Extract deadlines if mentioned
5. Respond ONLY with valid JSON, no markdown or explanations

Response format:
{"tasks": [{"title": "title", "description": "description", "priority": "LOW|MEDIUM|HIGH|URGENT", "dueDate": "YYYY-MM-DD or null", "tags": []}]}`,

      zh: `你是一位任务管理专家。分析文本并将其转换为可执行的任务。

规则：
1. 识别所有提到的任务
2. 如果有多个，分成单独的任务
3. 推断优先级：紧急、重要、关键 → HIGH/URGENT
4. 提取截止日期
5. 只用有效的JSON回复，不要markdown或解释

回复格式：
{"tasks": [{"title": "标题", "description": "描述", "priority": "LOW|MEDIUM|HIGH|URGENT", "dueDate": "YYYY-MM-DD 或 null", "tags": []}]}`,
    };

    return prompts[language] || prompts.en;
  }

  private getUserPrompt(language: string, transcription: string): string {
    const prompts: Record<string, string> = {
      es: `Analiza este texto y extrae las tareas. Responde solo con JSON:\n\n"${transcription}"`,
      en: `Analyze this text and extract tasks. Respond only with JSON:\n\n"${transcription}"`,
      zh: `分析此文本并提取任务。只用JSON回复：\n\n"${transcription}"`,
    };

    return prompts[language] || prompts.en;
  }
}
