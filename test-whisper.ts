import { WhisperCppProvider } from './src/lib/ai-providers/whisper-cpp';
import { readFileSync } from 'fs';
import { join } from 'path';

async function test() {
    console.log('Testing WhisperCppProvider...');

    // 1. Instanciar el provider
    const provider = new WhisperCppProvider({
        binaryPath: '/opt/homebrew/opt/whisper-cpp/bin/whisper-cli',
        modelEs: '/Users/alvarofuentes/.whisper-models/ggml-base.bin',
        modelEn: '/Users/alvarofuentes/.whisper-models/ggml-base.en.bin',
    });

    try {
        // Vamos a simular un request creando un archivo WAV pequeño o leyendo uno si existe
        // Por simplicidad, leeremos un archivo de prueba si existe
        console.log('Provider instanciado');
    } catch (e) {
        console.error('Error', e);
    }
}

test();
