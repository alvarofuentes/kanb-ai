// AI Provider Types

export type AIProviderType = 'openai' | 'groq' | 'deepseek' | 'ollama' | 'whisper-cpp';

export interface AIProviderConfig {
  name: string;
  apiKeyEnvVar: string;
  models: {
    transcription: string;
    chat: string;
  };
  getBaseUrl?: () => string;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
}

export interface ExtractedTask {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  tags?: string[];
}

export interface TaskExtractionResult {
  tasks: ExtractedTask[];
}

export interface AIProvider {
  transcribe(audioBase64: string): Promise<TranscriptionResult>;
  extractTasks(transcription: string, language: string): Promise<TaskExtractionResult>;
}

export interface AIProviderError {
  code: 'MISSING_API_KEY' | 'INVALID_API_KEY' | 'RATE_LIMIT' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
  provider: AIProviderType;
}
