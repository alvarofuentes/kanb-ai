import { AIProvider, AIProviderType } from './types';
import { OpenAIProvider } from './openai';
import { GroqProvider } from './groq';
import { DeepSeekProvider } from './deepseek';
import { OllamaProvider } from './ollama';
import { WhisperCppProvider } from './whisper-cpp';

export * from './types';
export * from './openai';
export * from './groq';
export * from './deepseek';
export * from './ollama';
export * from './whisper-cpp';

// Provider configurations
export const PROVIDER_CONFIGS = {
  openai: {
    name: 'OpenAI',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    description: 'GPT-4o-mini + Whisper',
    signupUrl: 'https://platform.openai.com/api-keys',
    pricing: 'Pay per use',
    supportsTranscription: true,
    supportsChat: true,
  },
  groq: {
    name: 'Groq',
    apiKeyEnvVar: 'GROQ_API_KEY',
    description: 'Llama 3.3 + Whisper (Free tier available!)',
    signupUrl: 'https://console.groq.com/keys',
    pricing: 'Free tier available',
    supportsTranscription: true,
    supportsChat: true,
  },
  deepseek: {
    name: 'DeepSeek',
    apiKeyEnvVar: 'DEEPSEEK_API_KEY',
    description: 'DeepSeek Chat (Great for task extraction)',
    signupUrl: 'https://platform.deepseek.com/api_keys',
    pricing: 'Very affordable',
    supportsTranscription: false, // DeepSeek doesn't have Whisper
    supportsChat: true,
  },
  ollama: {
    name: 'Ollama (Local)',
    apiKeyEnvVar: 'OLLAMA_BASE_URL', // URL-based, no API key needed
    description: 'Run LLMs locally - No cloud needed!',
    signupUrl: 'https://ollama.ai',
    pricing: 'Free (local)',
    supportsTranscription: true, // If whisper model is installed
    supportsChat: true,
  },
  'whisper-cpp': {
    name: 'Whisper.cpp (Local)',
    apiKeyEnvVar: 'WHISPER_CPP_ENABLED',
    description: 'Local Whisper transcription - Free & offline!',
    signupUrl: 'https://github.com/ggerganov/whisper.cpp',
    pricing: 'Free (local)',
    supportsTranscription: true,
    supportsChat: false, // Only transcription, use Ollama for chat
  },
} as const;

/**
 * Create an AI provider based on environment configuration
 * Priority: OPENAI_API_KEY > GROQ_API_KEY > DEEPSEEK_API_KEY > OLLAMA
 */
export function createAIProvider(): { provider: AIProvider; type: AIProviderType } | null {
  // Try OpenAI first
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      provider: new OpenAIProvider(openaiKey),
      type: 'openai',
    };
  }

  // Try Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return {
      provider: new GroqProvider(groqKey),
      type: 'groq',
    };
  }

  // Try DeepSeek
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    return {
      provider: new DeepSeekProvider(deepseekKey),
      type: 'deepseek',
    };
  }

  // Try Ollama (local or cloud)
  const ollamaUrl = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENABLED;
  if (ollamaUrl) {
    const baseUrl = ollamaUrl === 'true' ? 'http://localhost:11434/v1' : ollamaUrl;
    const chatModel = process.env.OLLAMA_CHAT_MODEL || 'llama3.2';
    const whisperModel = process.env.OLLAMA_WHISPER_MODEL || 'whisper';
    
    return {
      provider: new OllamaProvider(baseUrl, chatModel, whisperModel),
      type: 'ollama',
    };
  }

  // No provider configured
  return null;
}

/**
 * Get provider specifically for transcription (audio to text)
 * Priority: OpenAI > Groq > Whisper.cpp (local) > Ollama
 */
export function createTranscriptionProvider(): { provider: AIProvider; type: AIProviderType } | null {
  // OpenAI has Whisper - best for transcription
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      provider: new OpenAIProvider(openaiKey),
      type: 'openai',
    };
  }

  // Groq has Whisper too
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return {
      provider: new GroqProvider(groqKey),
      type: 'groq',
    };
  }

  // Whisper.cpp (local, free)
  const whisperCppEnabled = process.env.WHISPER_CPP_ENABLED;
  if (whisperCppEnabled === 'true') {
    return {
      provider: new WhisperCppProvider({
        binaryPath: process.env.WHISPER_CPP_BINARY || '/opt/homebrew/opt/whisper-cpp/bin/whisper-cli',
        modelEs: process.env.WHISPER_MODEL_ES || '/Users/alvarofuentes/.whisper-models/ggml-base.bin',
        modelEn: process.env.WHISPER_MODEL_EN || '/Users/alvarofuentes/.whisper-models/ggml-base.en.bin',
      }),
      type: 'whisper-cpp',
    };
  }

  // Ollama can use whisper model if installed
  const ollamaUrl = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENABLED;
  if (ollamaUrl) {
    const baseUrl = ollamaUrl === 'true' ? 'http://localhost:11434/v1' : ollamaUrl;
    const whisperModel = process.env.OLLAMA_WHISPER_MODEL || 'whisper';
    
    return {
      provider: new OllamaProvider(baseUrl, 'llama3.2', whisperModel),
      type: 'ollama',
    };
  }

  // DeepSeek doesn't support transcription
  return null;
}

/**
 * Get provider specifically for chat/task extraction
 * Priority: OpenAI > Groq > DeepSeek > Ollama
 */
export function createChatProvider(): { provider: AIProvider; type: AIProviderType } | null {
  // Try all providers in priority order
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      provider: new OpenAIProvider(openaiKey),
      type: 'openai',
    };
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return {
      provider: new GroqProvider(groqKey),
      type: 'groq',
    };
  }

  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    return {
      provider: new DeepSeekProvider(deepseekKey),
      type: 'deepseek',
    };
  }

  const ollamaUrl = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENABLED;
  if (ollamaUrl) {
    const baseUrl = ollamaUrl === 'true' ? 'http://localhost:11434/v1' : ollamaUrl;
    const chatModel = process.env.OLLAMA_CHAT_MODEL || 'llama3.2';
    
    return {
      provider: new OllamaProvider(baseUrl, chatModel, 'whisper'),
      type: 'ollama',
    };
  }

  return null;
}

/**
 * Check which providers are configured
 */
export function getConfiguredProviders(): AIProviderType[] {
  const configured: AIProviderType[] = [];
  
  if (process.env.OPENAI_API_KEY) {
    configured.push('openai');
  }
  
  if (process.env.GROQ_API_KEY) {
    configured.push('groq');
  }
  
  if (process.env.DEEPSEEK_API_KEY) {
    configured.push('deepseek');
  }
  
  if (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENABLED) {
    configured.push('ollama');
  }
  
  if (process.env.WHISPER_CPP_ENABLED === 'true') {
    configured.push('whisper-cpp');
  }
  
  return configured;
}

/**
 * Check if any AI provider is configured
 */
export function hasAIProvider(): boolean {
  return !!(
    process.env.OPENAI_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.OLLAMA_BASE_URL ||
    process.env.OLLAMA_ENABLED ||
    process.env.WHISPER_CPP_ENABLED === 'true'
  );
}

/**
 * Check if transcription is available
 */
export function hasTranscriptionProvider(): boolean {
  return !!(
    process.env.OPENAI_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.WHISPER_CPP_ENABLED === 'true' ||
    process.env.OLLAMA_BASE_URL ||
    process.env.OLLAMA_ENABLED
  );
}

/**
 * Check if chat is available (for task extraction)
 */
export function hasChatProvider(): boolean {
  return !!(
    process.env.OPENAI_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.OLLAMA_BASE_URL ||
    process.env.OLLAMA_ENABLED
  );
}

/**
 * Get the active provider type
 */
export function getActiveProviderType(): AIProviderType | null {
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.DEEPSEEK_API_KEY) return 'deepseek';
  if (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENABLED) return 'ollama';
  if (process.env.WHISPER_CPP_ENABLED === 'true') return 'whisper-cpp';
  return null;
}

/**
 * Get the active transcription provider type
 */
export function getTranscriptionProviderType(): AIProviderType | null {
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.WHISPER_CPP_ENABLED === 'true') return 'whisper-cpp';
  if (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENABLED) return 'ollama';
  return null; // DeepSeek doesn't support transcription
}

/**
 * Get the active chat provider type
 */
export function getChatProviderType(): AIProviderType | null {
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.DEEPSEEK_API_KEY) return 'deepseek';
  if (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENABLED) return 'ollama';
  return null; // whisper-cpp doesn't support chat
}
