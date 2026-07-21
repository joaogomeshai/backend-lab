# Documentation Index

## Topics

1. [Why Multi-Project Pipelines Exist](01-why-multi-project-pipelines.md)
2. [Why E2E Belongs in Its Own Repository](02-why-e2e-in-its-own-repository.md)
3. [GitHub Actions vs GitLab CI](03-github-vs-gitlab.md)
4. [Docker Workflow](04-docker-workflow.md)
5. [How Downstream Pipelines Work](05-downstream-pipelines.md)

## Architecture Overview

```
Browser ──> Frontend (Next.js) ──> Backend API (Fastify) ──> In-memory data
```

The frontend communicates with the backend via HTTP. Both are containerized with Docker and orchestrated with Docker Compose.

## CI/CD Flow

```
                    ┌─────────────────┐
                    │  Code Push       │
                    └──────┬──────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
      ┌────────────┐ ┌────────────┐ ┌────────────┐
      │ Frontend   │ │ Backend    │ │ Other      │
      │ Pipeline   │ │ Pipeline   │ │ Services   │
      └──────┬─────┘ └──────┬─────┘ └────────────┘
             │              │
             └──────┬───────┘
                    ▼
          ┌─────────────────┐
          │ Integration     │
          │ Pipeline (E2E)  │
          └─────────────────┘
```

## Running Locally

```bash
# Start the full stack (from project root)
docker compose -f frontend/docker-compose.yml up --build

# Or run backend alone
docker compose -f backend/docker-compose.yml up --build

# Then run E2E tests
cd e2e
npm ci
npx playwright test
```
