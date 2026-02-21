# Kan-B AI

<p align="center">
  <strong>Sistema de gestión de tareas con entrada por voz y extracción automática mediante IA</strong>
</p>

<p align="center">
  <a href="#-características">Características</a> •
  <a href="#-requisitos">Requisitos</a> •
  <a href="#-instalación">Instalación</a> •
  <a href="#-configuración">Configuración</a> •
  <a href="#-uso">Uso</a> •
  <a href="#-tecnologías">Tecnologías</a>
</p>

---

## 🚀 Características

- **🎙️ Grabación de voz** - Transcripción automática con detección de idioma (ES/EN/ZH)
- **🤖 Extracción de tareas con IA** - Convierte texto hablado en tareas estructuradas
- **📋 Tablero Kanban** - Arrastra y suelta tareas entre columnas
- **📊 Dashboard de productividad** - Visualiza tu progreso con gráficos
- **🌙 Diseño Adaptativo y Modo Oscuro** - Interfaz fluida con contraste optimizado para la vista
- **🌍 Multiidioma** - Interfaz en español e inglés
- **🔐 Autenticación** - Sistema de usuarios seguro
- **🔄 Múltiples proveedores de IA** - OpenAI, Groq, DeepSeek, Ollama

---

- **Demo**: https://y16jj1x6aby1-d.space.z.ai

- **⚠️ Esta es una demo visual. Para usar con IA, clona el repo y configura tus API keys.**

---

## 📋 Requisitos

- **Node.js** 18.0 o superior
- **Bun** 1.0+ (recomendado) o npm/yarn/pnpm
- **API Key** de cualquier proveedor: OpenAI, Groq, DeepSeek, u Ollama local

---

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/kanb-ai.git
cd kanb-ai
```

### 2. Instalar dependencias

Con Bun (recomendado):
```bash
bun install
```

Con npm:
```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Edita `.env` con tus valores:
```env
# Requerido - Genera un secreto aleatorio
NEXTAUTH_SECRET="tu-secreto-super-seguro-aqui"

# Elige al menos un proveedor de IA:
OPENAI_API_KEY="sk-..."      # OpenAI
GROQ_API_KEY="gsk_..."       # Groq (¡tiene plan gratis!)
DEEPSEEK_API_KEY="..."       # DeepSeek (disponible en China)
OLLAMA_ENABLED="true"        # Ollama local (¡gratis!)
```

### 4. Inicializar la base de datos

```bash
bun run db:push
# o
npm run db:push
```

### 5. Ejecutar la aplicación

```bash
bun run dev
# o
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔑 Configuración de IA

### Opción 1: Groq (Recomendado - ¡Gratis!)

1. Ve a [console.groq.com](https://console.groq.com)
2. Crea una cuenta gratuita
3. Genera una API Key
4. Añádela a tu `.env`:
   ```env
   GROQ_API_KEY="gsk_tu_clave_aqui"
   ```

**Ventajas:**
- ✅ Plan gratuito generoso
- ✅ Muy rápido (inference en tiempo real)
- ✅ Whisper para transcripción gratis
- ✅ Llama 3.3 para chat

### Opción 2: DeepSeek (Disponible en China)

1. Ve a [platform.deepseek.com](https://platform.deepseek.com/api_keys)
2. Crea una cuenta
3. Genera una API Key
4. Añádela a tu `.env`:
   ```env
   DEEPSEEK_API_KEY="tu_clave_aqui"
   ```

**Ventajas:**
- ✅ Disponible en China
- ✅ Muy económico
- ✅ Excelente para extracción de tareas
- ⚠️ No soporta transcripción de audio (solo chat)

**Nota:** DeepSeek no soporta transcripción de audio. Para usar voz con DeepSeek, combina con Groq u Ollama para transcripción.

### Opción 3: Ollama (Local - ¡Gratis!)

1. Instala Ollama: [ollama.ai](https://ollama.ai)
2. Descarga los modelos:
   ```bash
   ollama pull llama3.2      # Para extracción de tareas
   ollama pull whisper       # Para transcripción de audio
   ```
3. Configura tu `.env`:
   ```env
   OLLAMA_ENABLED="true"
   OLLAMA_CHAT_MODEL="llama3.2"
   OLLAMA_WHISPER_MODEL="whisper"
   ```

**Ventajas:**
- ✅ 100% gratis
- ✅ Funciona sin internet
- ✅ Privacidad total (datos locales)
- ✅ Disponible en cualquier región

### Opción 4: OpenAI

1. Ve a [platform.openai.com](https://platform.openai.com/api-keys)
2. Crea una cuenta
3. Genera una API Key
4. Añádela a tu `.env`:
   ```env
   OPENAI_API_KEY="sk_tu_clave_aqui"
   ```

**Modelos utilizados:**
- Transcripción: `whisper-1`
- Chat: `gpt-4o-mini`

**Nota:** OpenAI puede no estar disponible en todas las regiones.

---

## 📊 Comparación de Proveedores

| Proveedor | Transcripción | Chat                | Precio      | Disponibilidad |
| --------- | ------------- | ------------------- | ----------- | -------------- |
| Groq      | ✅ Whisper     | ✅ Llama 3.3         | Gratis tier | Global         |
| DeepSeek  | ❌             | ✅ DeepSeek Chat     | Muy barato  | China ✅        |
| Ollama    | ✅ Whisper     | ✅ Llama, Mistral... | Gratis      | Local          |
| OpenAI    | ✅ Whisper     | ✅ GPT-4o-mini       | Pay per use | Limitado       |

---

## 📦 Estructura del Proyecto

```
kanb-ai/
├── prisma/
│   └── schema.prisma      # Esquema de base de datos
├── src/
│   ├── app/               # Páginas y APIs (Next.js App Router)
│   │   ├── api/           # Endpoints REST
│   │   │   ├── transcribe/    # Transcripción de audio
│   │   │   ├── ai/           # Extracción de tareas con IA
│   │   │   ├── tasks/        # CRUD de tareas
│   │   │   └── auth/         # Autenticación
│   │   └── page.tsx       # Página principal
│   ├── components/        # Componentes React
│   │   ├── features/      # Componentes de funcionalidades
│   │   └── ui/            # Componentes base (shadcn/ui)
│   ├── context/           # Contextos de React
│   ├── lib/               # Utilidades y configuración
│   │   ├── ai-providers/  # OpenAI, Groq, DeepSeek, Ollama
│   │   └── translations.ts # Traducciones ES/EN
│   ├── store/             # Estado global (Zustand)
│   └── types/             # Tipos TypeScript
├── db/                    # Base de datos SQLite
├── .env.example           # Variables de entorno (template)
└── README.md
```

---

## 🎮 Uso

### Crear tareas por voz

1. Inicia sesión o crea una cuenta
2. Ve a la pestaña "Voice Input"
3. Haz clic en el botón del micrófono 🔴
4. Habla claramente (ej: "Necesito terminar el informe para el viernes y llamar al cliente mañana")
5. Clic en "Transcribe"
6. Clic en "Extract Tasks with AI"

### Crear tareas manualmente

1. Haz clic en "Add Task" en el encabezado
2. Completa título, descripción, prioridad y fecha
3. Guarda la tarea

### Gestionar tareas en Kanban

- Arrastra tareas entre columnas: Open → In Progress → Review → Completed
- Usa el menú (⋮) para editar prioridad o eliminar

---

## 🛠️ Tecnologías

| Categoría     | Tecnología                        |
| ------------- | --------------------------------- |
| Framework     | Next.js 16 (App Router)           |
| Lenguaje      | TypeScript 5                      |
| Estilos       | Tailwind CSS 4                    |
| UI            | shadcn/ui                         |
| Estado        | Zustand                           |
| Base de datos | SQLite + Prisma ORM               |
| Gráficos      | Recharts                          |
| Drag & Drop   | @dnd-kit                          |
| Auth          | NextAuth.js                       |
| IA            | OpenAI / Groq / DeepSeek / Ollama |

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
bun run dev          # Iniciar servidor de desarrollo

# Base de datos
bun run db:push      # Sincronizar esquema con BD
bun run db:generate  # Generar cliente Prisma

# Calidad
bun run lint         # Verificar código con ESLint

# Producción
bun run build        # Compilar para producción
bun run start        # Iniciar servidor de producción
```

---

## 🐛 Solución de Problemas

### Error: "AI provider not configured"

**Solución:** Asegúrate de tener configurada al menos una API key en `.env`:
```env
OPENAI_API_KEY="sk-..."      # o
GROQ_API_KEY="gsk_..."       # o
DEEPSEEK_API_KEY="..."       # o
OLLAMA_ENABLED="true"
```

### Error: "Country, region, or territory not supported"

**Solución:** OpenAI no está disponible en tu región. Usa Groq, DeepSeek u Ollama en su lugar.

### Error: "NEXTAUTH_SECRET is required"

**Solución:** Genera un secreto y añádelo a `.env`:
```bash
# Generar secreto aleatorio
openssl rand -base64 32
```

### Error de hidratación (Hydration Error)

**Solución:** Limpia el localStorage del navegador y recarga la página.

### La transcripción falla con Ollama

**Solución:** Asegúrate de tener el modelo whisper instalado:
```bash
ollama pull whisper
ollama list  # Verificar que está instalado
```

### DeepSeek no transcribe audio

**Nota:** DeepSeek no soporta transcripción de audio. Para usar voz:
- Combina DeepSeek con Groq u Ollama para transcripción
- O ingresa texto manualmente

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

---

## 👨‍💻 Autor

Proyecto de final de curso - Kan-B AI

---

<p align="center">
  Hecho con ❤️ usando Next.js y AI
</p>
