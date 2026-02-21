import { AIProvider, TranscriptionResult, TaskExtractionResult } from './types';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

// Whisper.cpp configuration - uses local whisper-cli binary
export interface WhisperCppConfig {
  binaryPath: string;
  modelEs: string;
  modelEn: string;
}

const DEFAULT_CONFIG: WhisperCppConfig = {
  binaryPath: '/opt/homebrew/opt/whisper-cpp/bin/whisper-cli',
  modelEs: '/Users/alvarofuentes/.whisper-models/ggml-base.bin',
  modelEn: '/Users/alvarofuentes/.whisper-models/ggml-base.en.bin',
};

export class WhisperCppProvider implements AIProvider {
  private config: WhisperCppConfig;

  constructor(config: Partial<WhisperCppConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async transcribe(audioBase64: string): Promise<TranscriptionResult> {
    const tempFile = join(tmpdir(), `audio_${Date.now()}.wav`);

    try {
      // 1. Decode base64 and save to temp raw file
      const rawFile = `${tempFile}_raw`;
      const buffer = Buffer.from(audioBase64, 'base64');
      await writeFile(rawFile, buffer);

      // 1.5 Convert raw file to 16kHz WAV expected by Whisper.cpp using ffmpeg
      console.log('Converting audio to 16kHz WAV...');
      await execAsync(`ffmpeg -i "${rawFile}" -ar 16000 -ac 1 -c:a pcm_s16le "${tempFile}"`);

      // 2. Detect language or use Spanish as default
      // We'll try Spanish first, then English if needed
      let model = this.config.modelEs;
      let language = 'es';

      // 3. Run whisper-cli
      const command = `"${this.config.binaryPath}" -m "${model}" -l ${language} -f "${tempFile}" --output-txt --output-file "${tempFile}"`;

      console.log('Running whisper-cli...');

      try {
        await execAsync(command, { timeout: 60000 });
      } catch (execError) {
        // If Spanish fails, try English
        console.log('Trying English model...');
        model = this.config.modelEn;
        language = 'en';
        const enCommand = `"${this.config.binaryPath}" -m "${model}" -l auto -f "${tempFile}" --output-txt --output-file "${tempFile}"`;
        await execAsync(enCommand, { timeout: 60000 });
      }

      // 4. Read the output file
      const outputFile = `${tempFile}.txt`;
      const output = await readFile(outputFile, 'utf-8');

      // 5. Parse the output - whisper.cpp format: [timestamp] text
      const lines = output.split('\n');
      const transcription = lines
        .map(line => {
          // Remove timestamps like [00:00:00.000 --> 00:00:05.000]
          const match = line.match(/\[\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}\]\s*(.+)/);
          return match ? match[1].trim() : line.trim();
        })
        .filter(line => line.length > 0)
        .join(' ');

      // 6. Detect actual language from transcription
      const detectedLanguage = this.detectLanguage(transcription);

      // 7. Clean up temp files
      try {
        await unlink(rawFile);
        await unlink(tempFile);
        await unlink(`${tempFile}.txt`);
      } catch {
        // Ignore cleanup errors
      }

      return {
        text: transcription,
        language: detectedLanguage,
      };
    } catch (error) {
      // Clean up on error
      try {
        const rawFile = `${tempFile}_raw`;
        await unlink(rawFile);
        await unlink(tempFile);
        await unlink(`${tempFile}.txt`);
      } catch {
        // Ignore cleanup errors
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Whisper.cpp transcription failed: ${errorMessage}`);
    }
  }

  async extractTasks(_transcription: string, _language: string): Promise<TaskExtractionResult> {
    // Whisper.cpp is only for transcription, not chat
    throw new Error(
      'Whisper.cpp only supports transcription. ' +
      'Use Ollama, DeepSeek, or another chat provider for task extraction.'
    );
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
}

// Check if whisper-cpp is available (only works locally)
export function isWhisperCppAvailable(): boolean {
  // This will be true when running locally with the config
  return !!(process.env.WHISPER_CPP_ENABLED === 'true');
}
