
# 🏆 Práctica Individual Frontend – "¿Y si sí me lo gané?"

**Entrega:** Mayo 21 — 15%

## 📌 Contexto del proyecto

En muchas ocasiones las personas participan en rifas, loterías, sorteos o compran boletas de diferentes maneras:

- En la calle
- A familiares o amigos
- En supermercados o centros comerciales (sorteos)
- Por internet
- En eventos o festivales
- Porque soñaron un número y decidieron jugarlo

El problema es que muchas veces las personas:

- olvidan qué número jugaron,
- no recuerdan cuándo era el sorteo,
- pierden la boleta,
- o incluso nunca revisan si ganaron.

Después de varios días aparece la típica frase: *"¿Y si sí me lo gané y nunca revisé?"*

La idea de esta práctica es desarrollar una aplicación web moderna que permita a cada usuario registrar y administrar todas sus boletas, rifas, loterías y sorteos en un solo lugar.

La aplicación deberá permitir que los usuarios:

- creen una cuenta,
- inicien sesión,
- registren sus boletas / sorteos,
- consulten sus boletas / sorteos,
- recuerden fechas de sorteos.

Tener una mejor organización de toda la información relacionada con juegos de azar y sorteos.

## 🎯 Objetivo de la práctica

Desarrollar el **frontend completo** de una aplicación web conectada a la API REST de este repositorio.

El objetivo es aplicar todos los conocimientos vistos durante el curso:

- HTML semántico
- CSS moderno y responsive
- TypeScript
- React / Next.js
- Manejo de estado
- Consumo de APIs REST
- Componentización
- Formularios
- Manejo de errores
- Routing
- Persistencia de sesión (localStorage, sessionStorage, cookies)
- Buenas prácticas de desarrollo web (clean architecture)

## 📱 Requisitos funcionales mínimos

### 1. 🔐 Autenticación

- Registro de usuario (Nombre, Email, Contraseña)
- Inicio de sesión (Login)
- Manejo de token JWT
- Persistencia de sesión
- Cierre de sesión / Botón logout

### 2. 🎟 Gestión de boletas / sorteos (CRUD)

Cada usuario debe poder crear registros con:

- Nombre del sorteo
- Número jugado (opcional)
- Fecha del sorteo
- Valor apostado (opcional)
- Lugar donde se compró
- Tipo de juego: `Lotería` / `Rifa` / `Sorteo` / `Boleta` / `Juego ocasional`
- Estado: `Pendiente` / `Ganado` / `Perdido`
- Notas adicionales (por ejemplo el premio a ganar)

CRUD completo:

- ✅ Crear registros
- ✅ Visualizar registros
- ✅ Editar registros
- ✅ Eliminar registros

### 3. 📋 Dashboard principal

- Cantidad de juegos registrados
- Próximos sorteos
- Juegos pendientes
- Historial (todas las boletas / sorteos)

### 4. 👤 Página del administrador

Filtros y búsqueda de premios / sorteos. Debe permitir:

- Buscar por número
- Buscar por nombre
- Filtrar por estado
- Filtrar por tipo de juego
- Paginación

### Validaciones generales

- Campos vacíos
- Formato email
- Fechas válidas
- Números inválidos

Mostrar errores visualmente.

---

# 🛠 API REST de soporte

> Esta sección documenta la API que ya está construida y que el frontend debe consumir.

## Stack

- **Express** + **TypeScript**
- **Prisma ORM** + **Prisma Postgres** (con `@prisma/adapter-pg`)
- **JWT** (jsonwebtoken) para autenticación
- **bcrypt** para hash de contraseñas
- **class-validator** + **class-transformer** para validación de DTOs
- **Clean Architecture** (domain / application / infrastructure / interface)

## Estructura del proyecto

```
src/
├── domain/              # Entidades, repositorios (interfaces), errores, servicios (puertos)
│   ├── entities/        # User, Ticket
│   ├── repositories/    # UserRepository, TicketRepository
│   ├── services/        # PasswordHasher (puerto)
│   └── errors/          # DomainError
├── application/         # Casos de uso, DTOs de aplicación
│   ├── usecases/
│   │   ├── auth/        # RegisterUser, LoginUser
│   │   └── tickets/     # CreateTicket, GetTickets, GetTicketById, UpdateTicket, DeleteTicket, GetAllTickets
│   └── dtos/            # PublicUser
├── infrastructure/      # Implementaciones concretas
│   ├── prisma/          # Cliente Prisma (con adapter-pg)
│   ├── prisma-client/   # Cliente generado (gitignored)
│   ├── repositories/    # PrismaUserRepository, PrismaTicketRepository
│   ├── security/        # BcryptPasswordHasher (adapter)
│   ├── config/          # env, jwt
│   └── validators/      # DTOs con class-validator
└── interface/           # Capa HTTP
    ├── controllers/     # authController, ticketsController, adminController
    ├── middlewares/     # authMiddleware, errorMiddleware, validateDto
    ├── routes/          # Router por versión (v1)
    └── types/           # Augmentaciones de Express (req.userId, etc.)
```

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
