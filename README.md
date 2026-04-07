# Star Wars Movies API

Backend REST API built with NestJS for managing Star Wars movies, with JWT authentication, role-based access control, and automatic synchronization from SWAPI.

## Technologies

- **NestJS** — Node.js framework
- **TypeORM** — ORM for PostgreSQL
- **PostgreSQL** — Database
- **JWT + Passport** — Authentication
- **class-validator / class-transformer** — DTO validation and serialization
- **@nestjs/swagger** — Swagger/OpenAPI documentation
- **bcryptjs** — Password hashing
- **@nestjs/schedule** — Cron jobs for automatic SWAPI sync

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL running locally (or accessible via network)

## Installation

```bash
npm install
```

## Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE starwars_movies;
```

2. Copy the environment file and fill in your values:
```bash
cp .env.example .env
```

3. Edit `.env` with your database credentials and JWT secret.

## Running the App

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The server will log:
```
Application running on: http://localhost:3000
Swagger docs: http://localhost:3000/api/docs
```

> **Note:** `synchronize: true` is enabled for development — TypeORM will auto-create/update tables. In production, set `synchronize: false` and use TypeORM migrations.

## Running Tests

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## API Endpoints

| Method | Path | Auth Required | Role |
|--------|------|---------------|------|
| POST | /auth/register | No | — |
| POST | /auth/register-admin | No | — |
| POST | /auth/login | No | — |
| GET | /users/me | Yes (Bearer) | USER, ADMIN |
| GET | /movies | No | — |
| GET | /movies/:id | Yes (Bearer) | USER, ADMIN |
| POST | /movies | Yes (Bearer) | ADMIN |
| PATCH | /movies/:id | Yes (Bearer) | ADMIN |
| DELETE | /movies/:id | Yes (Bearer) | ADMIN |
| POST | /movies/sync | Yes (Bearer) | ADMIN |

### Pagination & Filters

`GET /movies` supports optional query params:
- `?page=1` (default: 1)
- `?limit=10` (default: 10)
- `?title=hope` — partial case-insensitive title search
- `?director=lucas` — partial case-insensitive director search
- `?episode=4` — exact episode number filter

### SWAPI Sync

`POST /movies/sync` fetches all films from `https://www.swapi.tech/api/films` and upserts them into the database.

A cron job runs the same sync automatically every day at **3:00 AM**.

## Swagger Documentation

Available at: `http://localhost:3000/api/docs`

Includes Bearer authentication — click **Authorize** and paste your JWT token.

## Project Structure

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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_NAME` | Database name | `starwars_movies` |
| `JWT_SECRET` | Secret key for JWT signing | — (required) |
| `JWT_EXPIRATION` | JWT token expiration | `1d` |
| `SWAPI_BASE_URL` | SWAPI base URL | `https://www.swapi.tech/api` |
| `PORT` | HTTP server port | `3000` |
| `ADMIN_SECRET` | Secret required to register admin users | — (required) |
