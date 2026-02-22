# Arquitectura del Sistema: Kan-B AI

Este documento describe la arquitectura técnica subyacente de la aplicación Kan-B AI, detallando la organización del código, los flujos de datos y la integración de componentes.

## Stack Tecnológico Principal

- **Framework Frontend/Backend:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript 5
- **Estilización:** Tailwind CSS 4 + pre-procesador de utilidades `shadcn/ui`
- **Gestión de Estado Interno:** Zustand (Store Global) + React Context (Auth & Language)
- **Base de Datos:** SQLite (Desarrollo/Demo) gestionada vía Prisma ORM
- **Autenticación:** NextAuth.js (JWT Strategy)
- **Gestión de Drag & Drop:** `@dnd-kit`

## Organización del Proyecto (App Router)

La aplicación sigue el paradigma App Router de Next.js, centralizando código de Frontend y Backend en el mismo repositorio:

### 1. Backend & API (`/src/app/api/`)
Todos los endpoints son Serverless Functions de Next.js:

- **`/api/auth/[...nextauth]`**: Maneja el ciclo de vida de la autenticación usando Credenciales (Email/Password) y Hasheo bcrypt.
- **`/api/tasks`**: Endpoints CRUD RESTful protegidos para gestión de tareas de usuario.
- **`/api/ai/extract-tasks`**: Endpoint AI Core que procesa transcripciones o descripciones utilizando el proveedor configurado (OpenAI/Groq/DeepSeek) y formatea estructuradamente los JSON de salida.
- **`/api/transcribe`**: Manejador del FormData de audio cifrado en Base64, redirigiendo el blob hacia Whisper (OpenAI/Groq) u Ollama local.

### 2. Capa de Servicios Externos (`/src/lib/ai-providers/`)
Patrón *Strategy* para unificar la interacción con diferentes LLMs. Cada módulo (`openai.ts`, `groq.ts`, `deepseek.ts`, `ollama.ts`) expone dos interfaces uniformes:
- `transcribeAudio(audioBase64: string): string`
- `extractTasks(text: string): Task[]`

Esto permite cambiar en el `.env` el proveedor de IA sin reestructurar el componente que invoca la acción.

### 3. Modelo de Dominio de Base de Datos (`/prisma/schema.prisma`)
Modelo relacional simple entre Usuarios y Tareas interactuando mediante relaciones uno a muchos (1:N):
- **User**: Almacena Email unívoco, Nombre, Contraseña Encriptada y Timestamps.
- **Task**: Almacena UUID, Title, Description, Status, Priority, DueDate, Order (para persistir posición del Drag&Drop) y la relación al `userId`.

### 4. Capa de Presentación (Frontend)

- **Zustand Store (`/src/store/useTaskStore.ts`)**: Se encarga de la captura asíncrona de datos desde la API hacia el Frontend, y maneja de manera optimista el posicionamiento local del Drag&Drop.
- **Context API (`/src/context/`)**: Permite que objetos transversales como la identidad del Usuario (`AuthContext`) o el diccionario de traducciones (`LanguageContext`) fluyan globalmente sin prop-drilling.
- **Componentes Feature (`/src/components/features/`)**: Abarcan bloques de lógica gruesa (Ej. `voice-recorder`, `productivity-dashboard`, `kanban-board`).
- **Componentes UI (`/src/components/ui/`)**: Bloques de construcción primitivos y completamente reusables generados por Tailwind y `radix-ui` (Botones, Diálogos, Tabs, etc).

## Flujo de Trabajo Principal (Voice-to-Task)

1. **Captura:** El usuario mantiene pulsado el micrófono en el frontend. La API experimental `MediaRecorder` de los navegadores captura el flujo de audio.
2. **Post-procesado:** El audio se almacena temporalmente y se procesa hacia un String Base64 para atravesar la red de manera consistente.
3. **Petición REST:** Se envía hacia `/api/transcribe` protegido por un token JWT NextAuth.
4. **Gateway Provider:** El servidor lee el `.env` y decide el proveedor TTS activo, derivando el audio a la API externa correspondiente.
5. **Decodificación a JSON:** La redacción decodificada se envía a `/api/ai/extract-tasks` donde un metaprompt (Prompt engineering) incrusta la respuesta en un envoltorio estricto que genera un Array de objetos preformateados.
6. **Inserción DB:** El servidor Prisma almacena estas nuevas tareas unidas el `userId` y devuelve HTTP 201 Created.
7. **Reflejo UI:** Zustand Store se actualiza e inyecta las nuevas columnas llenas en el `kanban-board`.
