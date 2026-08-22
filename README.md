# G-TAX

A full-stack web platform that helps gig workers manage their taxes in one place — track income and expenses, scan receipts with OCR, get AI-suggested deductions, estimate tax with a slab-by-slab breakdown, run what-if simulations, follow filing deadlines, and ask a tax chatbot.

## Overview

Gig and freelance workers often juggle income from several sources and struggle to track deductible expenses or estimate what they owe. G-TAX brings this into a single dashboard: log income and expenses, upload a receipt and let OCR fill in the details, and see a live tax estimate. An AI service suggests likely deductions and answers tax questions using a retrieval-augmented knowledge base, while a what-if simulator shows how changes to income or deductions affect the result.

## Features

- **Income & expense tracking** — add, edit, and delete entries with categories
- **Receipt OCR** — upload a photo or PDF; amount, date, and vendor are extracted automatically
- **AI deduction suggestions** — the AI service flags likely deductible expenses with reasoning
- **Tax estimate** — slab-by-slab breakdown from income and deductible expenses
- **What-if simulator** — compare your current tax against hypothetical scenarios
- **Filing deadlines** — a calendar of upcoming tax dates
- **Tax chatbot** — a RAG-based assistant for tax questions
- **Authentication** — email/password plus Google and GitHub sign-in

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Spring Boot 3 (Java 21), Maven, REST API |
| AI service | FastAPI (Python 3.12) — OCR, categorization, RAG chat |
| Database & Auth | Supabase (Postgres, Auth, Storage, pgvector) |
| LLM | Gemini or Groq (with deterministic offline fallbacks) |
| Tooling | Docker Compose, GitHub Actions CI |

## Project Structure

```
G-TAX/
├── Frontend/         # React app: pages, components, hooks, API clients
├── Backend/          # Spring Boot: controllers, services, security, tests
├── AI/               # FastAPI: routers, services (OCR/RAG/LLM)
├── Database/         # schema, migrations, seeds, queries
├── Infrastructure/   # Docker, CI, editor settings
└── .github/          # GitHub Actions workflow
```

## Prerequisites

- Node.js 20+
- Java 21 and Maven
- Python 3.12
- A Supabase project (Postgres + Auth + Storage + pgvector)
- Docker (optional — for the containerized setup)

## Environment Variables

Create a `.env` file in the project root. No example file is committed, so the required
variables are listed below by service — fill in your own values.

**Supabase (shared by all services)**

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (backend only) |
| `SUPABASE_DB_URL` | JDBC Postgres URL (backend) |
| `SUPABASE_DB_USER` / `SUPABASE_DB_PASSWORD` | Database credentials |
| `SUPABASE_DB_DSN` | Postgres DSN (AI service / psql) |
| `SUPABASE_JWT_SECRET` | JWT secret used to verify auth tokens |
| `SUPABASE_STORAGE_BUCKET` | Bucket for receipt uploads |

**Backend**

| Variable | Description |
|----------|-------------|
| `BACKEND_PORT` | Port for the Spring Boot API |
| `BACKEND_CORS_ORIGINS` | Comma-separated allowed origins |

**AI service & LLM**

| Variable | Description |
|----------|-------------|
| `AI_SERVICE_PORT` / `AI_SERVICE_URL` | AI service port and base URL |
| `INTERNAL_API_KEY` | Shared secret for backend ↔ AI trust |
| `LLM_PROVIDER` | `gemini` or `groq` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Gemini credentials and model |
| `GROQ_API_KEY` / `GROQ_MODEL` | Groq credentials and model |
| `EMBEDDING_MODEL` / `EMBEDDING_DIM` | Embedding model and vector size |

**Tax parameters**

| Variable | Description |
|----------|-------------|
| `TAX_STANDARD_DEDUCTION` | Standard deduction amount |
| `TAX_FINANCIAL_YEAR_START_MONTH` | Financial-year start month |

**Frontend (browser — only `VITE_*` keys are exposed)**

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key |
| `VITE_API_BASE_URL` | Backend base URL (blank for same-origin) |

> Never expose the service-role key or JWT secret to the frontend. Only `VITE_*` variables reach the browser.

## Installation

```bash
# 1. Database — apply schema and seed data
psql "$SUPABASE_DB_DSN" -f Database/schema/schema.sql
psql "$SUPABASE_DB_DSN" -f Database/seeds/01_tax_deadlines.sql
psql "$SUPABASE_DB_DSN" -f Database/seeds/02_tax_rule_documents.sql

# 2. Python environment for the AI service
python -m venv venv
pip install -r AI/requirements.txt

# 3. Frontend dependencies
cd Frontend && npm install
```

## Running the Project

Start the three services (each in its own terminal):

```bash
# AI service      → http://localhost:8000
cd AI && ../venv/Scripts/python -m uvicorn app.main:app --port 8000

# Backend API     → http://localhost:8080
cd Backend && mvn spring-boot:run

# Frontend        → http://localhost:5173
cd Frontend && npm run dev
```

Or run the whole stack in containers:

```bash
docker compose -f Infrastructure/docker-compose.yml up --build
```

## Build

```bash
cd Frontend && npm run build     # production frontend bundle (Frontend/dist)
cd Backend  && mvn package       # backend JAR (Backend/target)
```

## Testing

```bash
cd Backend  && mvn test          # tax calculation and service tests
cd AI       && pytest -q         # OCR, categorization, RAG, chat (offline)
cd Frontend && npm run test      # frontend unit tests
```

## Deployment

The simplest option is Docker Compose, which builds and serves the frontend (nginx), backend, and AI service together; Supabase is managed and stays outside the container set. Each service also has its own Dockerfile under `Infrastructure/docker/` if you prefer to deploy them individually — for example, the frontend to a static host and the backend/AI to a container host. CI (build and test all three services) runs on every push via `.github/workflows/ci.yml`.

## License

No license has been specified yet. All rights reserved by the author unless a license is added.
