# 🏆 Mi Boleta API — Proyecto "¿Y si sí me lo gané?"

**Entrega:** 21 de mayo — **15%**

## 📌 Descripción del proyecto

Este repositorio es un monorepo que contiene:

- `backend/`: API REST con Node.js, Express, TypeScript, Prisma y JWT
- `frontend/`: aplicación React con TypeScript y Vite

La aplicación gestiona boletas y sorteos con autenticación, persistencia de sesión, CRUD de tickets, dashboard con métricas y administración protegida por roles.

## 📁 Estructura del repositorio

- `backend/`
  - `src/app.ts`, `src/index.ts`
  - `src/application/usecases/` (auth, tickets)
  - `src/domain/` (entities, repositories, services)
  - `src/infrastructure/` (prisma, repositorios, seguridad, validadores)
  - `src/interface/` (controllers, routes, middlewares)
  - `backend/.env.example`
  - `backend/docs/api-mi-boleta.postman_collection.json`

- `frontend/`
  - `src/App.tsx`, `src/routes.tsx`
  - `src/pages/` (dashboard, auth, admin, error)
  - `src/components/layout/` (Navbar, ProtectedRoute)
  - `src/core/api/apiClient.ts`
  - `src/core/store/authContext.tsx`
  - `src/core/types/index.ts`
  - `frontend/.env.example`

## 🚀 Tecnologías usadas

- Backend: Node.js, TypeScript, Express, Prisma, PostgreSQL, JWT, class-validator
- Frontend: React 19, TypeScript, Vite, React Router DOM, lucide-react

## ⚙️ Instalación y ejecución

### 1. Instalar dependencias

Desde la raíz del repositorio:

```bash
npm run install:all
```

### 2. Configurar variables de entorno

Copia los ejemplos y crea los archivos:

- `backend/.env`
- `frontend/.env`

#### Ejemplo `backend/.env`

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=algo_largo_y_secreto
PORT=4000
```

#### Ejemplo `frontend/.env`

```env
VITE_API_URL=http://localhost:4000/api/v1
```

### 3. Generar cliente Prisma y migraciones

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
```

### 4. Ejecutar en desarrollo

Desde la raíz:

```bash
npm run dev
```

O por carpeta:

```bash
npm run dev:backend
npm run dev:frontend
```

### 5. URLs de desarrollo

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api/v1`

## 📌 Características principales

### Autenticación y sesión

- Registro y login con JWT
- Persistencia de sesión en `localStorage`
- Logout seguro
- Protege rutas privadas y ruta `/admin`

### Boletas / Sorteos

- CRUD completo: crear, listar, editar, eliminar
- Campos manejados:
  - `title`
  - `gameType`
  - `gameNumber`
  - `gameDate`
  - `amount`
  - `place`
  - `status`
  - `notes`
- Confirmación de eliminación
- Actualización automática de la lista tras cada operación

### Dashboard

- Métricas de boletas: totales, pendientes, ganadas e inversión
- Vista de sorteos próximos y terminados
- Controles de búsqueda y filtrado

### Admin

- Ruta `/admin` accesible solo para usuarios con rol `admin`
- Filtros combinados y paginación
- Consumo de la API de administración

### Validaciones y UX

- Validación de formularios en el frontend
- Manejo de errores del backend en la UI
- Estados de carga, vacío y error
- Diseño responsive para desktop y mobile

## 🔧 Scripts disponibles

### Root

- `npm run install:all` — instala dependencias raíz, backend y frontend
- `npm run dev` — inicia backend y frontend en paralelo
- `npm run dev:backend` — inicia solo backend
- `npm run dev:frontend` — inicia solo frontend

### Backend

- `npm run dev` — servidor local con `ts-node-dev`
- `npm run build` — genera Prisma y compila backend
- `npm run prisma:generate` — genera cliente Prisma
- `npm run prisma:migrate` — aplica migraciones
- `npm run typecheck` — chequeo TypeScript

### Frontend

- `npm run dev` — inicia Vite
- `npm run build` — construye la app
- `npm run lint` — ejecuta ESLint

## 📌 Mapeo a la rúbrica

### 1. Autenticación y persistencia de sesión

- `frontend/src/core/store/authContext.tsx`
- `frontend/src/core/api/apiClient.ts`
- `frontend/src/pages/auth/Login.tsx`
- `frontend/src/pages/auth/Register.tsx`
- Guardado de token JWT en `localStorage`

### 2. CRUD completo de boletas / sorteos

- `frontend/src/pages/dashboard/Dashboard.tsx`
- Formulario con campos completos
- Confirmación al eliminar

### 3. Dashboard principal

- `frontend/src/pages/dashboard/Dashboard.tsx`
- Métricas y lista de boletas
- Filtros para vista de próximas y terminadas

### 4. Página de administrador

- `frontend/src/pages/admin/AdminPanel.tsx`
- Ruta `/admin` protegida por `ProtectedRoute`
- Filtros y paginación

### 5. Validaciones y manejo de errores

- Validación de campos, fechas y números
- Errores de backend mostrados en la UI
- Botones deshabilitados durante la carga

### 6. Diseño, responsive y UX

- `frontend/src/components/layout/Navbar.tsx`
- `frontend/src/index.css`
- Estados de carga, error y vacío

### 7. Arquitectura del frontend

- `frontend/src/core` para lógica reusable
- `frontend/src/pages` para cada pantalla
- `frontend/src/components` para layout y protección
- Tipos definidos en `frontend/src/core/types/index.ts`

### 8. Consumo correcto de la API REST

- `frontend/src/core/api/apiClient.ts`
- Token en `Authorization: Bearer <token>`
- Manejo de `401` para logout automático

### 9. Routing y protección de rutas

- `frontend/src/routes.tsx`
- `frontend/src/components/layout/ProtectedRoute.tsx`
- Rutas públicas y privadas bien separadas

### 10. Calidad del código

- TypeScript en backend y frontend
- ESLint configurado en frontend
- Buenas prácticas en nombres y organización

### 11. Despliegue y entrega

- Repo preparado para entrega
- README con instalación y configuración
- Demo desplegado: https://mi-boleta-api.vercel.app/login


