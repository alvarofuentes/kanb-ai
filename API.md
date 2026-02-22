# Documentación de la API: Kan-B AI

Este documento detalla los endpoints disponibles en la aplicación, sus métodos, requisitos de autenticación y estructuras de datos.

## Autenticación
Todos los endpoints (excepto `/api/auth/*`) requieren una cookie de sesión válida de NextAuth.js. El servidor validará el JWT y rechazará peticiones no autenticadas con `401 Unauthorized`.

---

## 📋 Tareas (`/api/tasks`)

### GET `/api/tasks`
Obtiene todas las tareas del usuario autenticado.
- **Respuesta (200 OK):** `Task[]` (Array de objetos de tarea)

### POST `/api/tasks`
Crea una nueva tarea manual.
- **Cuerpo (JSON):**
  - `title`: string (max 100 chars, requerido)
  - `description`: string (max 10000 chars, opcional)
  - `status`: "OPEN" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" (requerido)
  - `priority`: "LOW" | "MEDIUM" | "HIGH" | "URGENT" (requerido)
  - `dueDate`: string (ISO date, opcional)

### PUT `/api/tasks`
Actualiza una tarea existente. El servidor verifica que el usuario sea el dueño.
- **Cuerpo (JSON):** Contiene el `id` (requerido) y los campos a actualizar.

### DELETE `/api/tasks?id={uuid}`
Elimina una tarea específica.
- **Parámetros:** `id` de la tarea.

---

## ⚡ Operaciones de Lote y Estado

### POST `/api/tasks/reorder`
Actualiza el orden visual de las tareas en el tablero.
- **Cuerpo (JSON):** `{ tasks: { id: string, order: number, status: string }[] }`

### POST `/api/tasks/clear`
Elimina **todas** las tareas del usuario actual.
- **Respuesta (200 OK):** `{ success: true, count: number }`

### GET `/api/tasks/stats`
Obtiene estadísticas agregadas (conteo por estado, prioridad, tareas vencidas).

---

## 🤖 Inteligencia Artificial (`/api/ai`)

### POST `/api/ai/extract-tasks`
Procesa un texto para extraer tareas estructuradas.
- **Cuerpo (JSON):** `{ text: string }` (max 10.000 chars)
- **Seguridad:** Utiliza sandbox de prompts para evitar inyecciones.
- **Respuesta (200 OK):** `{ tasks: Partial<Task>[] }`

---

## 🎙️ Transcripción (`/api/transcribe`)

### POST `/api/transcribe`
Convierte un archivo de audio en texto.
- **Cuerpo (FormData):**
  - `audio`: Archivo de audio (máximo 5MB cifrado en Base64)
- **Respuesta (200 OK):** `{ text: string }`

### GET `/api/transcribe`
Chequea el estado de salud de los proveedores de IA configurados.
- **Respuesta (200 OK):** `{ providers: { name: string, configured: boolean }[] }`
