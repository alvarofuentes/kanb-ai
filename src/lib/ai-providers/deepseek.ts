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

  async transcribe(_audioBase64: string, _expectedLanguage?: string): Promise<TranscriptionResult> {
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
      es: `Eres un asistente experto en gestión de proyectos y tareas. Tu especialidad es descomponer tareas complejas en pasos accionables y manejables.

## REGLAS FUNDAMENTALES:

### 1. ANÁLISIS DE TAREAS
- Identifica TODAS las tareas mencionadas explícita o implícitamente
- Cada verbo de acción representa una tarea potencial
- Detecta tareas compuestas que requieren múltiples pasos

### 2. DESCOMPOSICIÓN DE TAREAS COMPLEJAS
Cuando una tarea implica múltiples pasos, DIVIDELA en subtareas:

Ejemplo: "Grabar un video para YouTube" →
- "Generar la idea del video"
- "Escribir el guion completo"
- "Elegir la locación de grabación"
- "Preparar y trasladar los equipos"
- "Grabar el video"
- "Editar el video"
- "Subir el video a YouTube"

### 3. CRITERIOS PARA SUBDIVIDIR
Subdivide una tarea si:
- Requiere más de una acción distinta
- Tiene fases claramente diferenciables
- Involucra preparación, ejecución y finalización
- Conlleva desplazamiento o preparación de materiales

### 4. PRIORIDADES
- URGENT: Crítico, inmediato, bloqueante
- HIGH: Importante, urgente, alta visibilidad
- MEDIUM: Normal, moderada importancia
- LOW: Puede esperar, bajo impacto

### 5. FECHAS LÍMITE
Extrae fechas mencionadas: "mañana", "el viernes", "para el 15", etc.
Convierte a formato YYYY-MM-DD usando la fecha actual como referencia.

### 6. ETIQUETAS
Asigna etiquetas relevantes: trabajo, personal, urgente, reunión, creative, etc.

## FORMATO DE RESPUESTA (SOLO JSON):
{
  "tasks": [
    {
      "title": "Título claro y accionable",
      "description": "Descripción detallada con contexto",
      "priority": "LOW|MEDIUM|HIGH|URGENT",
      "dueDate": "YYYY-MM-DD o null",
      "tags": ["etiqueta1", "etiqueta2"]
    }
  ]
}

IMPORTANTE: 
- Responde SOLO con JSON válido
- NO incluyas explicaciones fuera del JSON
- Cada subtarea debe ser una entrada separada en el array "tasks"`,

      en: `You are an expert project and task management assistant. Your specialty is breaking down complex tasks into actionable, manageable steps.

## FUNDAMENTAL RULES:

### 1. TASK ANALYSIS
- Identify ALL explicitly or implicitly mentioned tasks
- Each action verb represents a potential task
- Detect compound tasks that require multiple steps

### 2. DECOMPOSITION OF COMPLEX TASKS
When a task involves multiple steps, SPLIT IT into subtasks:

Example: "Record a YouTube video" →
- "Generate the video idea"
- "Write the complete script"
- "Choose the filming location"
- "Prepare and transport equipment"
- "Record the video"
- "Edit the video"
- "Upload video to YouTube"

### 3. CRITERIA FOR SUBDIVISION
Subdivide a task if:
- It requires more than one distinct action
- It has clearly differentiable phases
- It involves preparation, execution, and completion
- It involves travel or material preparation

### 4. PRIORITIES
- URGENT: Critical, immediate, blocking
- HIGH: Important, urgent, high visibility
- MEDIUM: Normal, moderate importance
- LOW: Can wait, low impact

### 5. DEADLINES
Extract mentioned dates: "tomorrow", "Friday", "by the 15th", etc.
Convert to YYYY-MM-DD format using current date as reference.

### 6. TAGS
Assign relevant tags: work, personal, urgent, meeting, creative, etc.

## RESPONSE FORMAT (JSON ONLY):
{
  "tasks": [
    {
      "title": "Clear actionable title",
      "description": "Detailed description with context",
      "priority": "LOW|MEDIUM|HIGH|URGENT",
      "dueDate": "YYYY-MM-DD or null",
      "tags": ["tag1", "tag2"]
    }
  ]
}

IMPORTANT:
- Respond ONLY with valid JSON
- Do NOT include explanations outside JSON
- Each subtask must be a separate entry in the "tasks" array`,

      zh: `你是项目和任务管理专家。你的专长是将复杂任务分解为可操作的、可管理的步骤。

## 基本规则：

### 1. 任务分析
- 识别所有明确或隐含提到的任务
- 每个动作动词代表一个潜在任务
- 检测需要多个步骤的复合任务

### 2. 复杂任务分解
当任务涉及多个步骤时，将其拆分为子任务：

示例："录制YouTube视频" →
- "生成视频创意"
- "编写完整脚本"
- "选择拍摄地点"
- "准备并运输设备"
- "录制视频"
- "编辑视频"
- "上传视频到YouTube"

### 3. 细分标准
如果符合以下条件，则细分任务：
- 需要多个不同的动作
- 有明显可区分的阶段
- 涉及准备、执行和完成
- 涉及出行或材料准备

### 4. 优先级
- URGENT: 紧急、立即、阻塞
- HIGH: 重要、紧急、高可见性
- MEDIUM: 正常、中等重要
- LOW: 可以等待、低影响

### 5. 截止日期
提取提到的日期："明天"、"周五"、"15号之前"等
转换为YYYY-MM-DD格式。

### 6. 标签
分配相关标签：工作、个人、紧急、会议、创意等。

## 响应格式（仅JSON）：
{
  "tasks": [
    {
      "title": "清晰可操作的标题",
      "description": "带上下文的详细描述",
      "priority": "LOW|MEDIUM|HIGH|URGENT",
      "dueDate": "YYYY-MM-DD 或 null",
      "tags": ["标签1", "标签2"]
    }
  ]
}

重要：
- 只用有效的JSON回复
- 不要在JSON之外包含解释
- 每个子任务必须是"tasks"数组中的单独条目`,
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
