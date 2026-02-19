# Flood Early Warning System

This repository contains the Simulated Work project for Kalvium (Sprint 1 – Full Stack Development).

The goal of this project is to design and build an early-warning system for flood-prone districts using open meteorological data, enabling local residents to better prepare through timely insights and alerts.

---

## Problem Statement

Flood-prone districts need early-warning systems based on open meteorological data.  
How might real-time visualization and alerting help local residents prepare?

---

## Project Objective

- Fetch and process open meteorological data
- Visualize rainfall and risk indicators clearly
- Provide simple, actionable alerts for residents
- Improve preparedness without over-complex forecasting

This system focuses on **awareness and early signals**, not precise flood prediction.

---

## Tech Stack (Sprint 1)

- **Frontend / Backend:** Next.js (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Caching:** Redis
- **Containerization:** Docker
- **Cloud Deployment:** AWS / Azure
- **CI/CD:** GitHub Actions
- **Data Sources:** Open meteorological APIs

---

## Repository Workflow

- `main` branch is protected
- All feature development happens via:
  - Issues
  - Feature branches
  - Pull Requests
  - Peer reviews

Direct pushes to `main` are not allowed after initialization.

---

## Team

- **Squad:** S65
- **Team Name:** LegitCoders
- **Program:** Kalvium Simulated Work

---

## Status

### ✅ Sprint 1 - Backend Development: COMPLETE

**All backend components fully implemented and production-ready:**

- ✅ **API Layer**: 19 REST endpoints across 5 categories
- ✅ **Database**: PostgreSQL with Prisma ORM (4 models with relationships)
- ✅ **Services**: Weather, Risk, Alert, District business logic
- ✅ **Middleware**: Error handling, logging, rate limiting
- ✅ **Caching**: Redis integration with cache-aside pattern
- ✅ **Scheduling**: Automated jobs (15-minute intervals)
- ✅ **Quality**: TypeScript strict mode, Zod validation, comprehensive error handling
- ✅ **Deployment**: Docker, Docker Compose, GitHub Actions CI/CD
- ✅ **Documentation**: Complete setup, API, architecture, and deployment guides
- ✅ **AWS Ready**: RDS PostgreSQL, ElastiCache Redis, ECS deployment

**52 source files** organized in clean architecture with full type safety.

---

## 📚 Documentation & Quick Start

### Essential Documents

- **[INDEX.md](INDEX.md)** - Master navigation guide (start here)
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project overview & deliverables
- **[SETUP.md](SETUP.md)** - Installation & local development
- **[API_EXAMPLES.md](API_EXAMPLES.md)** - API endpoints with curl examples
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design & patterns
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - AWS production deployment
- **[FILE_INVENTORY.md](FILE_INVENTORY.md)** - Complete file reference

### Quick Start (Docker - 3 commands)

```bash
docker-compose up -d
docker-compose exec app npm run db:migrate:prod
curl http://localhost:3000/api/health
```

### Quick Start (Local - Node.js)

```bash
npm install
cp .env.example .env.local
npm run db:migrate:dev && npm run dev
```

**Full instructions**: See [SETUP.md](SETUP.md)

---

## 🎯 Project Structure

```
src/
  ├── config/        # Configuration (env, database, redis)
  ├── controllers/   # HTTP request handlers
  ├── services/      # Business logic
  ├── middleware/    # Request processing
  ├── utils/         # Helper functions
  ├── jobs/          # Scheduled tasks
  └── prisma/        # Database models

pages/api/          # 19 REST API endpoints

prisma/            # Database schema & migrations

Documentation:
  ├── INDEX.md                    # Navigation hub
  ├── PROJECT_SUMMARY.md          # Delivery summary
  ├── SETUP.md                    # Setup guide
  ├── BACKEND_README.md           # Full documentation
  ├── API_EXAMPLES.md             # API testing
  ├── ARCHITECTURE.md             # System design
  ├── DEPLOYMENT.md               # AWS deployment
  └── FILE_INVENTORY.md           # File listing
```

---

## 🚀 Key Features

| Feature                 | Status | Details                                             |
| ----------------------- | ------ | --------------------------------------------------- |
| REST API (19 endpoints) | ✅     | Health, Districts, Weather, Risk, Alerts            |
| Database (PostgreSQL)   | ✅     | 4 models via Prisma ORM                             |
| Real-time Weather       | ✅     | OpenWeatherMap API integration                      |
| Risk Calculation        | ✅     | 4-factor algorithm (0-100 score)                    |
| Alert System            | ✅     | 4-level classification (Low/Moderate/High/Critical) |
| Redis Caching           | ✅     | 10-minute TTL, performance optimization             |
| Rate Limiting           | ✅     | 100 req/15 min per IP                               |
| Scheduled Jobs          | ✅     | Every 15 minutes via node-cron                      |
| Middleware Stack        | ✅     | Error handling, logging, rate limiting              |
| Docker                  | ✅     | Multi-stage build, docker-compose                   |
| CI/CD                   | ✅     | GitHub Actions pipeline                             |
| AWS Ready               | ✅     | RDS, ElastiCache, ECS deployment                    |

---

## 💻 Technology Stack

```
Runtime:        Node.js 18+, TypeScript 5.3
Framework:      Next.js 14 (API routes only)
Database:       PostgreSQL 15 + Prisma ORM
Cache:          Redis 7
Validation:     Zod 3.22
Logging:        Winston 3.11
Container:      Docker + Docker Compose
CI/CD:          GitHub Actions
Cloud:          AWS (RDS, ElastiCache, ECS)
```

---

## 🔍 Next Steps

1. **Review** → [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
2. **Setup** → Follow [SETUP.md](SETUP.md)
3. **Test** → Use curl examples from [API_EXAMPLES.md](API_EXAMPLES.md)
4. **Deploy** → Follow [DEPLOYMENT.md](DEPLOYMENT.md) for AWS
5. **Understand** → Review [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 📋 Deliverables Checklist

- ✅ Complete backend API (19 endpoints)
- ✅ Database design & schema (Prisma)
- ✅ Real-time weather integration
- ✅ Flood risk algorithm
- ✅ Alert generation system
- ✅ Redis caching layer
- ✅ Rate limiting middleware
- ✅ Scheduled background jobs
- ✅ Error handling & validation
- ✅ Structured logging
- ✅ Docker containerization
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ AWS deployment ready
- ✅ Comprehensive documentation
- ✅ API examples & curl commands

---
