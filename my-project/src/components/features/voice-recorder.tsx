'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Mic,
  Square,
  Send,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Languages,
  RotateCcw,
  X,
  ExternalLink,
  Key,
  Type,
  MicOff,
} from 'lucide-react';
import { useTaskStore } from '@/store/task-store';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onTasksExtracted?: (count: number) => void;
}

interface AIConfigError {
  errorType: string;
  hint: string;
  providers?: Record<string, { 
    name?: string;
    envVar: string; 
    signupUrl: string;
    supportsTranscription?: boolean;
    free?: boolean;
    local?: boolean;
  }>;
}

interface AIStatus {
  configured: boolean;
  provider: string | null;
  chatConfigured?: boolean;
  chatProvider?: string | null;
  allConfigured?: string[];
  providers?: Array<{
    type: string;
    name: string;
    supportsTranscription: boolean;
    supportsChat: boolean;
  }>;
  hint?: string;
}

export function VoiceRecorder({ onTasksExtracted }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [textInput, setTextInput] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<Array<{
    title: string;
    priority: string;
  }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<AIConfigError | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const { fetchTasks, fetchStats } = useTaskStore();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // Check AI status on mount
  useEffect(() => {
    fetch('/api/transcribe')
      .then(res => res.json())
      .then(data => setAiStatus(data))
      .catch(() => setAiStatus({ configured: false, provider: null }));
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Check if transcription is available
  const hasTranscription = aiStatus?.configured === true;
  
  // Check if chat/extraction is available
  const hasChatProvider = aiStatus?.chatConfigured === true || (aiStatus?.allConfigured && aiStatus.allConfigured.length > 0);
  const chatProviderName = aiStatus?.providers?.find(p => p.supportsChat)?.name || aiStatus?.chatProvider;

  const resetState = useCallback(() => {
    setAudioBlob(null);
    setTranscription('');
    setExtractedTasks([]);
    setDetectedLanguage('');
    setError(null);
    setConfigError(null);
    setTextInput('');
    audioChunksRef.current = [];
  }, []);

  const startRecording = useCallback(async () => {
    if (!hasTranscription) {
      setError(language === 'en' 
        ? 'Audio transcription not available. Please use text input below.' 
        : 'Transcripción de audio no disponible. Por favor usa el ingreso de texto abajo.');
      return;
    }
    
    try {
      resetState();
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const newAudioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(newAudioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(t.failedToAccessMicrophone);
    }
  }, [resetState, t.failedToAccessMicrophone, hasTranscription, language]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const transcribeAudio = useCallback(async (blobToTranscribe: Blob | null = audioBlob) => {
    if (!blobToTranscribe) return;

    setIsTranscribing(true);
    setError(null);
    setConfigError(null);

    try {
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          if (base64 && base64.length > 0) {
            resolve(base64);
          } else {
            reject(new Error('Failed to convert audio to base64'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(blobToTranscribe);
      });

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64Audio }),
      });

      const data = await response.json();

      if (data.success) {
        setTranscription(data.transcription);
        setDetectedLanguage(language);
        setAudioBlob(null);
        setAiStatus({ configured: true, provider: data.provider });
      } else if (data.errorType === 'MISSING_API_KEY') {
        setConfigError(data);
        setError(data.error);
      } else {
        setError(data.error || 'Failed to transcribe audio');
        if (data.hint) {
          setError(prev => prev + ' - ' + data.hint);
        }
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to transcription service');
    } finally {
      setIsTranscribing(false);
    }
  }, [audioBlob, language]);

  const extractTasks = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setIsExtracting(true);
    setError(null);
    setConfigError(null);

    try {
      const response = await fetch('/api/ai/extract-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: text,
          language: language,
          saveToDb: true,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setExtractedTasks(
          data.tasks.map((task: { title: string; priority: string }) => ({
            title: task.title,
            priority: task.priority,
          }))
        );
        setTranscription(text);
        setDetectedLanguage(language);
        if (user?.id) {
          await fetchTasks(user.id);
          await fetchStats(user.id);
        }
        onTasksExtracted?.(data.tasks.length);
      } else if (data.errorType === 'MISSING_API_KEY') {
        setConfigError(data);
        setError(data.error);
      } else {
        setError(data.error || 'Failed to extract tasks');
        if (data.hint) {
          setError(prev => prev + ' - ' + data.hint);
        }
      }
    } catch (err) {
      console.error('Task extraction error:', err);
      setError('Failed to extract tasks from text');
    } finally {
      setIsExtracting(false);
    }
  }, [language, fetchTasks, fetchStats, onTasksExtracted, user?.id]);

  const handleSendText = useCallback(() => {
    if (textInput.trim()) {
      extractTasks(textInput);
    }
  }, [textInput, extractTasks]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              {t.voiceRecordingTitle}
            </CardTitle>
            <CardDescription>
              {t.voiceRecordingDesc}
            </CardDescription>
          </div>
          {(audioBlob || transcription || extractedTasks.length > 0) && (
            <Button variant="ghost" size="sm" onClick={resetState} className="gap-1">
              <X className="h-4 w-4" />
              {t.clear}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Status Indicator */}
        {aiStatus && (
          <div className="space-y-2">
            {/* Chat Provider Status */}
            {hasChatProvider ? (
              <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {language === 'en' 
                    ? `Task extraction: ${chatProviderName || 'AI Provider'} connected` 
                    : `Extracción de tareas: ${chatProviderName || 'Proveedor IA'} conectado`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {language === 'en' 
                    ? 'No task extraction provider configured' 
                    : 'Sin proveedor de extracción de tareas'}
                </span>
              </div>
            )}
            
            {/* Transcription Status */}
            {hasTranscription ? (
              <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {language === 'en' 
                    ? `Voice transcription: ${aiStatus.provider?.toUpperCase()} connected` 
                    : `Transcripción de voz: ${aiStatus.provider?.toUpperCase()} conectado`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <MicOff className="h-4 w-4" />
                <span>
                  {language === 'en' 
                    ? 'Voice transcription not available - Use text input below' 
                    : 'Transcripción de voz no disponible - Usa el ingreso de texto abajo'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Configuration Error Alert */}
        {configError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{language === 'en' ? 'AI Not Configured' : 'IA No Configurada'}</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">{configError.hint}</p>
              {configError.providers && (
                <div className="space-y-2">
                  <p className="font-medium">{language === 'en' ? 'Get your API key:' : 'Obtén tu API key:'}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(configError.providers).map(([key, provider]) => (
                      <a 
                        key={key}
                        href={provider.signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm underline"
                      >
                        {provider.name || key} 
                        {provider.free && <span className="text-green-600">({language === 'en' ? 'Free!' : '¡Gratis!'})</span>}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Voice Recording Section */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            variant={isRecording ? 'destructive' : hasTranscription ? 'default' : 'outline'}
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              'h-16 w-16 rounded-full',
              isRecording && 'animate-pulse',
              !hasTranscription && 'opacity-50'
            )}
            disabled={isTranscribing || isExtracting || !hasTranscription}
            title={!hasTranscription ? (language === 'en' ? 'Voice transcription not available' : 'Transcripción de voz no disponible') : undefined}
          >
            {isRecording ? (
              <Square className="h-6 w-6" />
            ) : hasTranscription ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </Button>

          {audioBlob && !isRecording && (
            <Button
              size="lg"
              onClick={() => transcribeAudio()}
              disabled={isTranscribing || isExtracting}
              className="min-w-[140px]"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.transcribing}
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  {t.transcribe}
                </>
              )}
            </Button>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center justify-center gap-2 text-red-500">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </span>
            {t.recording}
          </div>
        )}

        {error && !configError && (
          <div className="flex items-center justify-between gap-2 rounded-md bg-red-50 p-3 text-red-600 dark:bg-red-950 dark:text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
            {audioBlob && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => transcribeAudio()}
                disabled={isTranscribing}
                className="shrink-0"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                {t.retry}
              </Button>
            )}
          </div>
        )}

        {transcription && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t.transcription}</h3>
              <Badge variant="secondary">
                {language === 'es' ? t.spanish : t.english}
              </Badge>
            </div>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm whitespace-pre-wrap">{transcription}</p>
              </CardContent>
            </Card>
            {!extractedTasks.length && (
              <Button
                onClick={() => extractTasks(transcription)}
                disabled={isExtracting}
                className="w-full"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.extractingTasks}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t.extractTasks}
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {extractedTasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <h3 className="font-semibold">
                {extractedTasks.length} {extractedTasks.length === 1 ? t.taskCreated : t.tasksCreated}
              </h3>
            </div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {extractedTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border bg-card p-3"
                  >
                    <span className="text-sm font-medium">{task.title}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        task.priority === 'URGENT' && 'border-red-500 text-red-600',
                        task.priority === 'HIGH' && 'border-orange-500 text-orange-600',
                        task.priority === 'MEDIUM' && 'border-amber-500 text-amber-600',
                        task.priority === 'LOW' && 'border-slate-500 text-slate-600'
                      )}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Text Input Section - Always visible */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-muted-foreground">
              {t.orTypeDirectly}
            </h3>
          </div>
          <Textarea
            placeholder={t.typePlaceholder}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={handleSendText}
            disabled={!textInput.trim() || isExtracting}
            className="w-full"
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === 'en' ? 'Extracting tasks...' : 'Extrayendo tareas...'}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t.processText}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
