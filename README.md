# Star Wars Movies API

API REST backend construida con NestJS para gestionar películas de Star Wars, con autenticación JWT, control de acceso por roles y sincronización automática desde SWAPI.

## Deploy en producción

El proyecto está configurado para ser desplegado de forma automática en **Render** usando el archivo `render.yaml` incluido.

| | URL |
|--|--|
| **API Base** | *(Tu URL de Render, ej: https://starwars-movies-api.onrender.com)* |
| **Documentación Swagger** | *(Tu URL de Render)/api/docs* |

### Credenciales de prueba

**Usuario regular** (rol: `user`):
```
email:    user@conexa.com
password: Test1234!
```

**Usuario administrador** (rol: `admin`):
```
email:    admin@conexa.com
password: Admin1234!
```

**Admin Secret** (requerido para registrar nuevos administradores vía `POST /auth/register-admin`):
```
conexa-admin-2026
```

> **Tip:** Usá `POST /auth/login` con las credenciales de arriba, copiá el `access_token` y hacé clic en **Authorize** en Swagger.

## Tecnologías

- **NestJS** — Framework de Node.js
- **TypeORM** — ORM para PostgreSQL
- **PostgreSQL** — Base de datos
- **JWT + Passport** — Autenticación
- **class-validator / class-transformer** — Validación y serialización de DTOs
- **@nestjs/swagger** — Documentación Swagger/OpenAPI
- **bcryptjs** — Hashing de contraseñas
- **@nestjs/schedule** — Cron jobs para sincronización automática con SWAPI
- **@nestjs/throttler** — Rate Limiting (Protección contra abusos)
- **Helmet & Compression** — Seguridad y optimización de respuestas HTTP

## Requisitos previos

- Node.js 18+
- npm
- PostgreSQL corriendo localmente (o accesible por red)

## Instalación

```bash
npm install
```

## Configuración de la base de datos

1. Crear una base de datos PostgreSQL:
```sql
CREATE DATABASE starwars_movies;
```

2. Copiar el archivo de entorno y completar los valores:
```bash
cp .env.example .env
```

3. Editar `.env` con las credenciales de la base de datos y el JWT secret.

## Ejecutar la aplicación

```bash
# Desarrollo (modo watch)
npm run start:dev

# Build de producción
npm run build
npm run start:prod
```

El servidor loguea al iniciar:
```
Application running on: http://localhost:3000
Swagger docs: http://localhost:3000/api/docs
```

> **Nota:** `synchronize: true` está habilitado para desarrollo — TypeORM crea/actualiza las tablas automáticamente. En producción usar `synchronize: false` y migraciones de TypeORM.

## Ejecutar tests

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Modo watch
npm run test:watch
```

## Endpoints de la API

| Método | Ruta | Autenticación | Rol |
|--------|------|---------------|-----|
| POST | /auth/register | No | — |
| POST | /auth/register-admin | No | — |
| POST | /auth/login | No | — |
| GET | /users/me | Sí (Bearer) | USER, ADMIN |
| GET | /movies | No | — |
| GET | /movies/:id | Sí (Bearer) | USER, ADMIN |
| POST | /movies | Sí (Bearer) | ADMIN |
| PATCH | /movies/:id | Sí (Bearer) | ADMIN |
| DELETE | /movies/:id | Sí (Bearer) | ADMIN |
| POST | /movies/sync | Sí (Bearer) | ADMIN |

### Paginación y filtros

`GET /movies` acepta query params opcionales:
- `?page=1` (por defecto: 1)
- `?limit=10` (por defecto: 10)
- `?title=hope` — búsqueda parcial por título (case-insensitive)
- `?director=lucas` — búsqueda parcial por director (case-insensitive)
- `?episode=4` — filtro exacto por número de episodio

### Sincronización con SWAPI

`POST /movies/sync` obtiene todas las películas de `https://www.swapi.tech/api/films` y las sincroniza en la base de datos (upsert).

Un cron job ejecuta la misma sincronización automáticamente todos los días a la **1:00 AM**.

## Colección de Postman

El archivo `postman_collection.json` está incluido en la raíz del proyecto.

**Cómo importar:**

1. Abrir Postman.
2. Hacer clic en **File → Import** (o `Ctrl+O` / `Cmd+O`).
3. Seleccionar `postman_collection.json` desde la raíz del proyecto.
4. La colección **"Star Wars Movies API"** aparecerá en el sidebar.

**Cómo autenticarse:**

1. Ejecutar **POST /auth/login** con las credenciales de prueba.
2. Copiar el valor de `access_token` de la respuesta.
3. Hacer clic en el nombre de la colección → pestaña **Variables**.
4. Pegar el token en la variable `token` (columna Current Value).
5. Todos los requests que requieren Bearer token lo tomarán automáticamente vía `{{token}}`.

---

## Documentación Swagger

- **Producción:** *(Tu URL de Render)/api/docs*
- **Local:** `http://localhost:3000/api/docs`

Incluye autenticación Bearer — hacer clic en **Authorize** y pegar el JWT token.

## Estructura del proyecto

```
src/
├── auth/
│   ├── decorators/        # @Public(), @Roles(), @CurrentUser()
│   ├── dto/               # login.dto.ts, register.dto.ts, register-admin.dto.ts
│   ├── guards/            # jwt-auth.guard.ts, roles.guard.ts
│   ├── strategies/        # jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── users/
│   ├── dto/               # create-user.dto.ts
│   ├── entities/          # user.entity.ts, role.enum.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── movies/
│   ├── dto/               # create-movie.dto.ts, update-movie.dto.ts, query-movie.dto.ts
│   ├── entities/          # movie.entity.ts
│   ├── movies.controller.ts
│   ├── movies.module.ts
│   └── movies.service.ts
├── swapi/
│   ├── swapi.module.ts
│   └── swapi.service.ts
├── common/
│   ├── filters/           # http-exception.filter.ts
│   └── interceptors/      # transform.interceptor.ts
├── app.module.ts
└── main.ts
```

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `DB_NAME` | Nombre de la base de datos | `starwars_movies` |
| `JWT_SECRET` | Clave secreta para firmar JWT | — (requerido) |
| `JWT_EXPIRATION` | Expiración del token JWT | `1d` |
| `SWAPI_BASE_URL` | URL base de SWAPI | `https://www.swapi.tech/api` |
| `PORT` | Puerto HTTP del servidor | `3000` |
| `ADMIN_SECRET` | Secreto para registrar usuarios admin | — (requerido) |
