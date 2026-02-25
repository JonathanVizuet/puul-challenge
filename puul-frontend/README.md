# puul-frontend

Cliente web del sistema de gestión de tareas para challenge técnico Puul, construido con Angular 17 y TypeScript. Consume la API REST desarrollada en `puul-api`.

La arquitectura completa del proyecto, decisiones técnicas y documentación de la API se encuentran en:
**https://www.notion.so/Challenge-Back-End-Puul-30e83ffea94880d1abb6c976d1bc82e0**

---

## Requisitos previos

- Node.js
- Angular CLI v17 (`npm install -g @angular/cli@17`)
- La API `puul-api` corriendo en `http://localhost:3000`

---

## Instalación

```bash
# 1. Entrar a la carpeta del frontend
cd puul-frontend

# 2. Instalar dependencias
npm install --legacy-peer-deps

# 3. Levantar el servidor de desarrollo
ng serve
```

La aplicación estará disponible en `http://localhost:4200`.

---

## Variables de entorno

El archivo `src/environments/environment.ts` contiene la URL base de la API:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1'
};
```

Si la API corre en un puerto distinto, actualiza el valor de `apiUrl`.

---

## Estructura del proyecto

```
src/app/
├── core/
│   ├── guards/         # AuthGuard — protege rutas privadas
│   ├── interceptors/   # JWT Interceptor + Error Interceptor
│   └── services/       # AuthService, UsersService, TasksService, AnalyticsService
├── shared/
│   └── models/         # Interfaces TypeScript (User, Task, ApiResponse)
└── features/
    ├── auth/login/     # Pantalla de login
    ├── users/          # Gestión de usuarios
    ├── tasks/          # Gestión de tareas
    └── analytics/      # Dashboard de estadísticas
```

---

## Uso

1. Asegúrate de que `puul-api` esté corriendo.
2. Inicia sesión con el correo de un usuario existente en la base de datos.
3. Navega entre las secciones: **Usuarios**, **Tareas** y **Analítica**.
