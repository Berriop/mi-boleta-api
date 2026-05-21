
# 🏆 Práctica Individual Frontend – "¿Y si sí me lo gané?"

**Entrega:** Mayo 21 — 15%

## 📌 Resumen del proyecto

Este repositorio contiene una solución monorepo para una app de boletas/sorteos con:

- `backend/`: API REST en Express + TypeScript + Prisma + JWT
- `frontend/`: UI en React + TypeScript + Vite

La aplicación permite al usuario registrarse, iniciar sesión, persistir sesión con JWT, crear/editar/eliminar boletas, ver un dashboard con métricas y una sección de administración con filtros y paginación.

## 🧭 Modo de uso

### Requisitos

- Node.js 20+ (recomendado)
- npm 10+
- PostgreSQL local o remota

### Instalación

Ejecuta desde la raíz del proyecto:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### Backend

1. Copia `backend/.env.example` a `backend/.env`.
2. Ajusta las variables:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=algosecreto
PORT=4000
```

3. Genera Prisma y ejecuta migraciones:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Ejecuta el backend:

```bash
cd backend
npm run dev
```

La API estará disponible en `http://localhost:4000/api/v1`.

### Frontend

1. (Opcional) Crea un archivo `.env` en `frontend/` con la URL de la API:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

2. Ejecuta la app de React:

```bash
cd frontend
npm run dev
```

La aplicación se sirve en `http://localhost:5173`.

### Iniciar ambos juntos

Desde la raíz:

```bash
npm run dev
```

> Este comando usa `concurrently` para levantar frontend y backend en paralelo.

## 🎯 Funcionalidades implementadas

- Registro y login con JWT
- Persistencia de sesión en `localStorage`
- Logout que elimina token y usuario
- CRUD completo de boletas: crear, listar, editar, eliminar
- Filtros por búsqueda, estado y tipo de juego
- Dashboard con métricas y sorteos próximos
- Ruta `admin` protegida para usuarios con `role = admin`
- Manejo de errores del backend y validación cliente
- Routing privado y 403/404
- Arquitectura con carpetas separadas: `pages`, `components`, `core`, `api`, `store`

## 🔧 Mapeo a la rúbrica

### 1. Autenticación y persistencia de sesión

- `frontend/src/core/store/authContext.tsx`: `login`, `register`, `logout`
- `frontend/src/core/api/apiClient.ts`: inyección de token en headers y manejo de `401`
- `localStorage` guarda `mi_boleta_token` y `mi_boleta_user`
- Logout limpia la sesión y redirige al login
- `Login.tsx` y `Register.tsx` muestran errores del backend y validación de credenciales

### 2. CRUD completo de boletas / sorteos

- `frontend/src/pages/dashboard/Dashboard.tsx`: listado de boletas, creación, edición y eliminación
- El formulario contiene campos de `title`, `gameType`, `gameNumber`, `gameDate`, `amount`, `place`, `status`, `notes`
- `fetchTickets()` actualiza la UI tras cada operación sin recarga manual
- Confirmación de eliminación en modal antes de borrar

### 3. Dashboard principal

- `Dashboard.tsx` muestra métricas: total de boletas, pendientes, ganadas, monto invertido
- Muestra sorteos próximos y lista de historial
- Conteos se actualizan al recargar datos del backend

### 4. Página de administrador

- `frontend/src/pages/admin/AdminPanel.tsx` implementa la vista `/admin`
- `frontend/src/routes.tsx` protege la ruta con `ProtectedRoute adminOnly={true}`
- Se consumen datos de `/admin/tickets`
- Soporta filtros por `q`, `status`, `gameType` y paginación combinados

### 5. Validaciones y manejo de errores

- `Login.tsx`, `Register.tsx` y `Dashboard.tsx` validan campos vacíos, email, contraseña, fechas y números
- Errores del backend de tipo `Datos inválidos:` se parsean y se muestran junto a cada campo
- Los botones se deshabilitan durante la carga (`isLoading`, `isSubmitting`)

### 6. Diseño, responsive y UX

- UI con componentes reutilizables y estilos del proyecto
- Layout responsivo usando `grid`, botones y tarjetas adaptables
- Estados de carga, error y vacío están contemplados en el diseño
- Navegación clara con `Navbar` y secciones bien jerarquizadas

### 7. Arquitectura del frontend

- `frontend/src/core`: cliente API, store de auth y tipos globales
- `frontend/src/components`: layout y componentes reutilizables
- `frontend/src/pages`: páginas por funcionalidad
- Uso de TypeScript con tipos específicos (`Ticket`, `User`, `ApiResponse`)
- Lógica de negocio separada de la UI en `apiClient` y `authContext`

### 8. Consumo correcto de la API REST

- `frontend/src/core/api/apiClient.ts` centraliza todas las llamadas HTTP
- `Authorization: Bearer <token>` agregado automáticamente en requests protegidas
- Manejo de errores HTTP específicos: `401` fuerza logout y redirección
- Se usa el contrato de la API para `data` y `meta`

### 9. Routing y protección de rutas

- `frontend/src/routes.tsx`: rutas públicas (`/login`, `/register`) y privadas (`/dashboard`, `/admin`)
- `ProtectedRoute.tsx` redirige a `/login` si no hay sesión
- `/admin` redirige a `/403` si el usuario no es admin
- Existe página `NotFound` para rutas inválidas

### 10. Calidad del código

- TypeScript en frontend y backend
- Estructura clara de archivos y nombres coherentes
- `frontend/package.json` incluye `lint` y `build` para revisión
- Sin dependencias innecesarias en la configuración principal

### 11. Despliegue y entrega

- Repositorio organizado y público en GitHub
- `README` documenta cómo instalar, configurar y ejecutar backend/frontend
- No hay demo desplegado actualmente. Si se despliega, agregar el link aquí.

## 🚀 Comandos útiles

Desde la raíz:

```bash
npm run install:all
npm run dev
```

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Construir frontend:

```bash
cd frontend
npm run build
```

Prisma Backend:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
```

## 📌 Notas importantes

- No se debe comitear `.env` con credenciales reales.
- `backend/.env.example` está disponible como plantilla.
- Si despliegas la aplicación, agrega la URL de demo en esta sección.

## ⚙️ Setup local

1. **Instalar dependencias**

   ```bash
   npm install
   ```

2. **Variables de entorno** — crea un `.env` basado en `.env.example`:

   ```env
   DATABASE_URL=postgres://...      # Connection string de Prisma Postgres o cualquier Postgres
   JWT_SECRET=algo_largo_y_secreto
   PORT=4000
   ```

3. **Generar cliente Prisma y aplicar migración inicial**

   ```bash
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   ```

4. **Promover un usuario a admin** (manualmente en la DB):

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'tu@email.com';
   ```

5. **Arrancar en desarrollo**

   ```bash
   npm run dev
   ```

   La API queda disponible en `http://localhost:4000/api/v1`.

## 📚 Endpoints

**Base URL:** `/api/v1`

Todas las respuestas exitosas siguen el formato:

```json
{ "data": <resultado>, "meta": <opcional, para listas paginadas> }
```

Todas las respuestas de error siguen:

```json
{ "error": "mensaje legible" }
```

### Autenticación

#### `POST /auth/register`

Crea un usuario nuevo (rol `user` por defecto).

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "secret123"
}
```

**201 Created:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "user",
    "createdAt": "2026-05-14T..."
  }
}
```

Validaciones: `name` (2-80), `email` válido, `password` ≥ 8 caracteres.

#### `POST /auth/login`

**Body:**
```json
{ "email": "juan@example.com", "password": "secret123" }
```

**200 OK:**
```json
{
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "uuid",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "user",
      "createdAt": "..."
    }
  }
}
```

El JWT expira en 24h. Para todas las rutas protegidas envía:

```
Authorization: Bearer <token>
```

### Tickets (requiere autenticación)

#### `GET /tickets`

Lista los tickets del usuario autenticado con filtros y paginación.

**Query params (todos opcionales):**

| Param | Valores | Default |
|---|---|---|
| `status` | `Pendiente` \| `Ganado` \| `Perdido` | — |
| `gameType` | `Lotería` \| `Rifa` \| `Sorteo` \| `Boleta` \| `Juego ocasional` | — |
| `q` | búsqueda en `title` y `gameNumber` | — |
| `page` | número entero ≥ 1 | 1 |
| `pageSize` | 1-100 | 20 |

**200 OK:**
```json
{
  "data": [ { "id": "...", "title": "...", "gameType": "Lotería", ... } ],
  "meta": { "total": 42, "page": 1, "pageSize": 20, "totalPages": 3 }
}
```

#### `GET /tickets/:id`

Devuelve un ticket específico del usuario. **404** si no existe o pertenece a otro usuario.

#### `POST /tickets`

**Body:**
```json
{
  "title": "Lotería de Medellín",
  "gameType": "Lotería",
  "gameNumber": "1234",
  "gameDate": "2026-06-15T20:00:00.000Z",
  "amount": 5000,
  "place": "Tienda La Esquina",
  "status": "Pendiente",
  "notes": "Soñé con el número la semana pasada"
}
```

**Obligatorios:** `title`, `gameType`, `gameDate`, `status`.
**Opcionales:** `gameNumber`, `amount`, `place`, `notes`.

**201 Created** con el ticket creado en `data`.

#### `PUT /tickets/:id`

Actualización **parcial** — solo envía los campos que quieras cambiar. Misma validación que `POST`.

#### `DELETE /tickets/:id`

**204 No Content** si se eliminó. **404** si no existía.

### Admin (requiere `role = "admin"`)

#### `GET /admin/tickets`

Lista **todos los tickets de todos los usuarios** con info del dueño. Útil para la página de administrador.

**Query params (opcionales):**

| Param | Notas |
|---|---|
| `status`, `gameType`, `page`, `pageSize` | Igual que `GET /tickets` |
| `q` | Busca en `title`, `gameNumber`, `owner.name`, `owner.email` |
| `userId` | Filtra por dueño específico |

**200 OK:**
```json
{
  "data": [
    {
      "id": "...", "title": "...", "gameType": "Lotería", "status": "Pendiente",
      "gameDate": "...", "gameNumber": "1234", "amount": 5000,
      "owner": { "id": "...", "name": "Juan Pérez", "email": "juan@example.com" }
    }
  ],
  "meta": { "total": 42, "page": 1, "pageSize": 20, "totalPages": 3 }
}
```

Un usuario no-admin recibe **403 Forbidden**.

## 🧪 Códigos de error

| Código | Significado |
|---|---|
| 400 | Datos inválidos (validación class-validator) |
| 401 | No autenticado / token inválido |
| 403 | Autenticado pero sin permisos (no-admin en endpoints admin) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (email ya registrado) |
| 500 | Error interno del servidor |

## 📬 Colección de Postman

Importa [`docs/api-mi-boleta.postman_collection.json`](docs/api-mi-boleta.postman_collection.json) en Postman.

Incluye:

- Todos los endpoints organizados por carpeta (Auth, Tickets, Admin).
- Variables de colección: `baseUrl`, `token`, `ticketId`.
- **Test scripts automáticos**: el login guarda el token y el "crear ticket" guarda el `ticketId` para reutilizar en los siguientes requests.

## 🧱 Modelo de datos

### `users`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | |
| `email` | text | UNIQUE |
| `password_hash` | text | bcrypt |
| `role` | text | `user` \| `admin` (CHECK), default `user` |
| `created_at` | timestamptz | default `now()` |

### `tickets`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → users(id) ON DELETE CASCADE |
| `title` | text | Nombre del sorteo |
| `game_type` | text | enum lógico |
| `game_number` | text? | Número jugado |
| `game_date` | timestamptz | Fecha del sorteo |
| `amount` | numeric(12,2)? | Valor apostado |
| `place` | text? | Lugar de compra |
| `status` | text | enum lógico |
| `notes` | text? | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Índices: `(user_id, game_date)`, `(user_id, status)`, `(user_id, game_type)`.

## 🔐 Notas para el frontend

1. **Persistencia de sesión**: tras login, guarda el `token` (y opcionalmente el `user`) en `localStorage` o cookie. En cada request añade `Authorization: Bearer <token>`.
2. **Expiración**: el token dura 24h. Si recibes un `401`, redirige al login.
3. **CORS**: la API tiene `cors()` abierto en desarrollo. En producción se debe restringir al origen del frontend.
4. **Fechas**: `gameDate` se envía y recibe en formato ISO 8601 (`2026-06-15T20:00:00.000Z`).
5. **Decimales**: `amount` es número (no string). La API lo devuelve ya convertido.
6. **Validación 400**: los mensajes vienen agrupados en `error`, separados por `;` y prefijados con el nombre del campo, p. ej. `"Datos inválidos: email: El email no es válido; password: ..."`. Útil para mostrar al usuario.

## 🚀 Deploy

El proyecto está preparado para desplegar en **Render** (ver [`render.yaml`](render.yaml)).

- **Build Command:** `npm install --include=dev && npm run build`
- **Start Command:** `npm start`
- **Health Check:** `/api/v1`
- Variables: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_VERSION`.

## 📜 Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Modo desarrollo con hot-reload (ts-node-dev) |
| `npm run build` | `prisma generate && tsc` (output en `dist/`) |
| `npm start` | Ejecuta `dist/index.js` |
| `npm run typecheck` | Verifica tipos sin compilar |
| `npm run prisma:generate` | Regenera el cliente Prisma |
| `npm run prisma:migrate` | `prisma migrate dev` (crea y aplica migración) |
| `npm run prisma:deploy` | `prisma migrate deploy` (aplica migraciones existentes — producción) |
