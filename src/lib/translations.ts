export type Language = 'en' | 'es';

export const translations = {
  en: {
    // App
    appName: 'Kan-B AI',
    appTagline: 'Voice-powered task management',
    appDescription: 'Create tasks using voice commands with AI-powered transcription and smart task extraction. Manage your workflow with an intuitive Kanban board.',

    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Log out',
    clearBoard: 'Clear Board',
    clearBoardTitle: 'Are you absolutely sure?',
    clearBoardDesc: 'This action cannot be undone. This will permanently delete your entire task pipeline from the servers.',
    continue: 'Continue',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name (optional)',
    createAccount: 'Create Account',
    signingIn: 'Signing in...',
    creatingAccount: 'Creating account...',
    welcomeBack: 'Welcome back',

    // Landing page
    manageTasksWithVoice: 'Manage Tasks with Your Voice',
    landingDescription: 'Simply speak your thoughts, and our AI will automatically transcribe and convert them into actionable tasks. Organize with our intuitive Kanban board and track your productivity.',
    voiceRecording: 'Voice Recording',
    voiceRecordingDesc: 'Record your voice in English or Spanish and let AI transcribe it automatically.',
    aiTaskExtraction: 'AI Task Extraction',
    aiTaskExtractionDesc: 'Our AI analyzes your transcription and creates structured, actionable tasks.',
    kanbanBoard: 'Kanban Board',
    kanbanBoardDesc: 'Drag and drop tasks across columns to manage your workflow visually.',
    getStarted: 'Get Started',

    // Navigation
    voice: 'Voice',
    voiceInput: 'Voice Input',
    board: 'Board',
    kanbanBoardNav: 'Kanban Board',
    dashboard: 'Dashboard',
    stats: 'Stats',
    refresh: 'Refresh',
    addTask: 'Add Task',

    // Voice Recorder
    voiceRecordingTitle: 'Voice Recording & Transcription',
    voiceRecordingInstruction: 'Record your voice or type to create tasks automatically',
    recording: 'Recording... Speak now',
    transcribe: 'Transcribe',
    transcribing: 'Transcribing...',
    transcription: 'Transcription',
    extractTasks: 'Extract Tasks with AI',
    extractingTasks: 'Extracting Tasks...',
    taskCreated: 'Task Created',
    tasksCreated: 'Tasks Created',
    orTypeDirectly: 'Or type your tasks directly',
    typePlaceholder: "Describe your tasks here... (e.g., 'I need to finish the project report by Friday, call the client tomorrow, and review the budget next week')",
    processText: 'Process Text',
    clear: 'Clear',
    retry: 'Retry',
    failedToAccessMicrophone: 'Failed to access microphone. Please grant permission and try again.',

    // Kanban
    open: 'Open',
    pending: 'Pending',
    inProgress: 'In Progress',
    review: 'Review',
    completed: 'Completed',
    dropTasksHere: 'Drop tasks here',

    // Task Card
    edit: 'Edit',
    delete: 'Delete',
    priority: 'Priority',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',

    // Add Task Dialog
    createNewTask: 'Create New Task',
    addTaskDescription: 'Add a new task to your board. Fill in the details below.',
    title: 'Title',
    titlePlaceholder: 'What needs to be done?',
    description: 'Description',
    descriptionPlaceholder: 'Add more details about this task...',
    status: 'Status',
    dueDate: 'Due Date',
    pickADate: 'Pick a date',
    cancel: 'Cancel',
    create: 'Create Task',
    creating: 'Creating...',

    // Dashboard
    totalTasks: 'Total Tasks',
    allTasksInWorkspace: 'All tasks in workspace',
    completionRate: 'Completion Rate',
    dueToday: 'Due Today',
    tasksDueToday: 'Tasks due today',
    overdue: 'Overdue',
    pastDueDate: 'Past due date',
    taskStatusDistribution: 'Task Status Distribution',
    overviewByStatus: 'Overview of tasks by status',
    tasksByPriority: 'Tasks by Priority',
    distributionPriorities: 'Distribution of task priorities',
    recentActivity: 'Recent Activity',
    taskUpdates7Days: 'Task updates in the last 7 days',
    thisWeek: 'This Week',
    tasksDue: 'tasks due',
    inProgressActive: 'active',
    inReviewPending: 'pending',

    // Language Selection
    selectLanguage: 'Select Language',
    language: 'Language',
    english: 'English',
    spanish: 'Español',

    // Footer
    copyright: '© 2026 Kan-B AI. Voice-powered productivity.',
    aiReady: 'AI Ready',
    aiPowered: 'AI Powered',

    // Misc
    loading: 'Loading...',
    profile: 'Profile',
    settings: 'Settings',
  },
  es: {
    // App
    appName: 'Kan-B AI',
    appTagline: 'Gestión de tareas por voz',
    appDescription: 'Crea tareas usando comandos de voz con transcripción potenciada por IA y extracción inteligente de tareas. Gestiona tu flujo de trabajo con un tablero Kanban intuitivo.',

    // Auth
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    signOut: 'Cerrar sesión',
    clearBoard: 'Limpiar Tablero',
    clearBoardTitle: '¿Estás completamente seguro?',
    clearBoardDesc: 'Esta acción no se puede deshacer. Se eliminarán para siempre todas las tareas actuales del tablero desde la base de datos.',
    continue: 'Continuar',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    name: 'Nombre (opcional)',
    createAccount: 'Crear cuenta',
    signingIn: 'Iniciando sesión...',
    creatingAccount: 'Creando cuenta...',
    welcomeBack: 'Bienvenido de nuevo',

    // Landing page
    manageTasksWithVoice: 'Gestiona Tareas con Tu Voz',
    landingDescription: 'Simplemente habla tus pensamientos, y nuestra IA transcribirá automáticamente y los convertirá en tareas accionables. Organiza con nuestro tablero Kanban intuitivo y rastrea tu productividad.',
    voiceRecording: 'Grabación de Voz',
    voiceRecordingDesc: 'Graba tu voz en inglés o español y deja que la IA la transcriba automáticamente.',
    aiTaskExtraction: 'Extracción de Tareas con IA',
    aiTaskExtractionDesc: 'Nuestra IA analiza tu transcripción y crea tareas estructuradas y accionables.',
    kanbanBoard: 'Tablero Kanban',
    kanbanBoardDesc: 'Arrastra y suelta tareas entre columnas para gestionar tu flujo de trabajo visualmente.',
    getStarted: 'Comenzar',

    // Navigation
    voice: 'Voz',
    voiceInput: 'Entrada de Voz',
    board: 'Tablero',
    kanbanBoardNav: 'Tablero Kanban',
    dashboard: 'Panel',
    stats: 'Estadísticas',
    refresh: 'Actualizar',
    addTask: 'Agregar Tarea',

    // Voice Recorder
    voiceRecordingTitle: 'Grabación de Voz y Transcripción',
    voiceRecordingInstruction: 'Graba tu voz o escribe para crear tareas automáticamente',
    recording: 'Grabando... Habla ahora',
    transcribe: 'Transcribir',
    transcribing: 'Transcribiendo...',
    transcription: 'Transcripción',
    extractTasks: 'Extraer Tareas con IA',
    extractingTasks: 'Extrayendo tareas...',
    taskCreated: 'Tarea Creada',
    tasksCreated: 'Tareas Creadas',
    orTypeDirectly: 'O escribe tus tareas directamente',
    typePlaceholder: "Describe tus tareas aquí... (ej., 'Necesito terminar el informe del proyecto para el viernes, llamar al cliente mañana y revisar el presupuesto la próxima semana')",
    processText: 'Procesar Texto',
    clear: 'Limpiar',
    retry: 'Reintentar',
    failedToAccessMicrophone: 'No se pudo acceder al micrófono. Por favor, concede permiso e inténtalo de nuevo.',

    // Kanban
    open: 'Abierto',
    pending: 'Pendiente',
    inProgress: 'En Progreso',
    review: 'Revisión',
    completed: 'Completado',
    dropTasksHere: 'Suelta tareas aquí',

    // Task Card
    edit: 'Editar',
    delete: 'Eliminar',
    priority: 'Prioridad',
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente',

    // Add Task Dialog
    createNewTask: 'Crear Nueva Tarea',
    addTaskDescription: 'Agrega una nueva tarea a tu tablero. Completa los detalles a continuación.',
    title: 'Título',
    titlePlaceholder: '¿Qué necesita hacerse?',
    description: 'Descripción',
    descriptionPlaceholder: 'Agrega más detalles sobre esta tarea...',
    status: 'Estado',
    dueDate: 'Fecha límite',
    pickADate: 'Elige una fecha',
    cancel: 'Cancelar',
    create: 'Crear Tarea',
    creating: 'Creando...',

    // Dashboard
    totalTasks: 'Total de Tareas',
    allTasksInWorkspace: 'Todas las tareas en el espacio',
    completionRate: 'Tasa de Finalización',
    dueToday: 'Vence Hoy',
    tasksDueToday: 'Tareas que vencen hoy',
    overdue: 'Vencidas',
    pastDueDate: 'Pasaron la fecha límite',
    taskStatusDistribution: 'Distribución de Estados',
    overviewByStatus: 'Vista general de tareas por estado',
    tasksByPriority: 'Tareas por Prioridad',
    distributionPriorities: 'Distribución de prioridades de tareas',
    recentActivity: 'Actividad Reciente',
    taskUpdates7Days: 'Actualizaciones de tareas en los últimos 7 días',
    thisWeek: 'Esta Semana',
    tasksDue: 'tareas pendientes',
    inProgressActive: 'activas',
    inReviewPending: 'pendientes',

    // Language Selection
    selectLanguage: 'Seleccionar Idioma',
    language: 'Idioma',
    english: 'English',
    spanish: 'Español',

    // Footer
    copyright: '© 2026 Kan-B AI. Productividad potenciada por voz.',
    aiReady: 'IA Lista',
    aiPowered: 'Potenciado por IA',

    // Misc
    loading: 'Cargando...',
    profile: 'Perfil',
    settings: 'Configuración',
  },
} as const;

export type Translations = typeof translations.en;
