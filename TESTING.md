# Guía de Pruebas y Calidad: Kan-B AI

Este documento describe cómo asegurar la integridad del código y validar los tipos en el proyecto.

## Validación Estática

El proyecto utiliza **TypeScript** y **ESLint** para atrapar errores antes de la ejecución.

### Verificación de Tipos
Para validar que todos los contratos de componentes y APIs son correctos, ejecuta:
```bash
npx tsc --noEmit
```
*Nota: Este comando no genera archivos, solo reporta errores de lógica de tipos.*

### Análisis de Código (Linting)
Para asegurar que el código sigue las reglas de estilo y buenas prácticas de Next.js:
```bash
npm run lint
```

## Pruebas de Seguridad Manuales

### 1. Validación de Sesión (No-Auth)
- Intenta acceder a `/api/tasks` mediante una herramienta como Postman sin enviar cookies.
- **Resultado esperado:** `401 Unauthorized`.

### 2. Validación de IDOR
- Como Usuario A, intenta enviar un `PUT` a `/api/tasks` con el ID de una tarea que pertenece al Usuario B.
- **Resultado esperado:** `404 Not Found` o `403 Forbidden`. El sistema ignorará la petición al no encontrar la tarea asociada al `userId` del JWT.

### 3. Validación de DoS
- Intenta enviar un archivo de audio superior a 5MB al endpoint de transcripción.
- **Resultado esperado:** `400 Bad Request` por exceder el límite de Zod.

## Flujo de Construcción (Build)

Antes de cualquier despliegue, es obligatorio que el comando de construcción pase con éxito:
```bash
npm run build
```
Este comando integra la minificación, optimización de imágenes y la verificación estática final.
