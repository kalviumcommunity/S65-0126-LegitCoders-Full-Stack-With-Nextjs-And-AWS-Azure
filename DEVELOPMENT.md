# Development Setup Guide

This guide will help you set up the Flood Early Warning System development environment.

## Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Docker** and **Docker Compose**
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd S65-0126-LegitCoders-Full-Stack-With-Nextjs-And-AWS-Azure
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration. For local development, the default values should work.

### 4. Start Services with Docker

Start PostgreSQL and Redis using Docker Compose:

```bash
docker compose up -d postgres redis
```

Wait for services to be healthy (check with `docker compose ps`).

### 5. Setup Database

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply new migration
- `docker compose up` - Start all services (app, db, redis)
- `docker compose down` - Stop all services

## Project Structure

```
.
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/         # API routes
│   │   ├── page.tsx     # Home page
│   │   └── layout.tsx   # Root layout
│   └── lib/             # Shared utilities
│       ├── prisma.ts    # Prisma client
│       └── redis.ts     # Redis client
├── prisma/
│   └── schema.prisma    # Database schema
├── public/              # Static assets
├── docker-compose.yml   # Docker services
├── Dockerfile          # Application container
└── .env.example        # Environment variables template
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns service health status.

### Districts
```
GET /api/districts     # List all districts
POST /api/districts    # Create new district
```

## Database Management

### View Database
```bash
npx prisma studio
```

### Create Migration
```bash
npx prisma migrate dev --name <migration-name>
```

### Reset Database
```bash
npx prisma migrate reset
```

## Docker Deployment

### Build and Run All Services
```bash
docker compose up --build
```

### Run in Background
```bash
docker compose up -d
```

### View Logs
```bash
docker compose logs -f app
```

### Stop Services
```bash
docker compose down
```

## Troubleshooting

### Port Already in Use
If ports 3000, 5432, or 6379 are already in use, update the `.env` file:
```
APP_PORT=3001
POSTGRES_PORT=5433
REDIS_PORT=6380
```

### Database Connection Issues
1. Ensure PostgreSQL is running: `docker compose ps`
2. Check DATABASE_URL in `.env`
3. Try resetting: `npx prisma migrate reset`

### Redis Connection Issues
1. Ensure Redis is running: `docker compose ps`
2. Check REDIS_URL in `.env`
3. Test connection: `docker compose exec redis redis-cli ping`

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run linting and tests
4. Submit a pull request

## Tech Stack

- **Frontend/Backend**: Next.js 16 (TypeScript)
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Cache**: Redis 7
- **Styling**: Tailwind CSS
- **Containerization**: Docker

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com)
- [Redis Documentation](https://redis.io/docs)
