# Multi-Project Pipeline Lab — Complete Reference

> A learning laboratory for understanding Multi-Project Pipelines, Docker-based
> deployments, and cross-repository end-to-end testing using TypeScript throughout.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Repository Structure](#2-repository-structure)
3. [Backend API (Fastify)](#3-backend-api-fastify)
4. [Frontend (Next.js)](#4-frontend-nextjs)
5. [Docker & Docker Compose](#5-docker--docker-compose)
6. [E2E Testing (Playwright)](#6-e2e-testing-playwright)
7. [CI/CD — GitHub Actions](#7-cicd--github-actions)
8. [CI/CD — GitLab CI](#8-cicd--gitlab-ci)
9. [Cross-Repo Dependency Coordination](#9-cross-repo-dependency-coordination)
10. [Branch Protection](#10-branch-protection)
11. [Pipeline Flow Diagrams](#11-pipeline-flow-diagrams)
12. [Complete File Reference](#12-complete-file-reference)

---

## 1. Architecture Overview

```
┌──────────┐     HTTP      ┌──────────┐     In-Memory
│ Browser  │ ──────────▶   │  Next.js │ ──────────▶   ┌──────────┐
│ (User)   │ ◀──────────   │ Frontend │ ◀──────────   │  Fastify │
└──────────┘     HTML      └──────────┘     JSON      │ Backend  │
                                                       └──────────┘
```

**Technology Stack**

| Layer | Technology | Language |
|-------|-----------|----------|
| Frontend | Next.js 15 (App Router) | TypeScript |
| Backend | Fastify 5 | TypeScript |
| E2E Tests | Playwright | TypeScript |
| Styling | TailwindCSS v4 | CSS |
| Containerization | Docker + Docker Compose | — |
| CI/CD | GitHub Actions + GitLab CI | YAML |

**Key Design Decisions**

- **No database** — all data is in-memory. The focus is on CI/CD architecture, not
  data persistence.
- **No authentication** — the blog is fully public. Authentication would add
  complexity without contributing to the learning goals.
- **TypeScript everywhere** — the entire stack uses TypeScript, reducing context
  switching and letting the focus stay on infrastructure.
- **Each folder is a future repo** — the code is structured so each folder
  (`frontend/`, `backend/`, `e2e/`) can be split into its own Git repository
  without significant refactoring.

---

## 2. Repository Structure

```
multi-project-pipeline-lab/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── articleController.ts    # HTTP handlers
│   │   ├── data/
│   │   │   └── articles.ts             # 13 in-memory articles
│   │   ├── routes/
│   │   │   └── articleRoutes.ts        # Route definitions
│   │   ├── services/
│   │   │   └── articleService.ts       # Business logic
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript types
│   │   ├── __tests__/
│   │   │   └── articleService.test.ts  # Unit tests
│   │   └── index.ts                    # App entry point
│   ├── docs/                           # Documentation
│   ├── Dockerfile
│   ├── docker-compose.yml              # Backend standalone
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root layout (nav + main)
│   │   │   ├── page.tsx                # Homepage (topic grid)
│   │   │   ├── not-found.tsx           # 404 page
│   │   │   ├── error.tsx               # Error page
│   │   │   ├── loading.tsx             # Loading state
│   │   │   ├── globals.css             # Tailwind imports
│   │   │   └── articles/[slug]/
│   │   │       └── page.tsx            # Article detail page
│   │   ├── components/
│   │   │   └── TopicCard.tsx            # Topic card with color coding
│   │   ├── services/
│   │   │   └── api.ts                   # Fetch API client
│   │   └── types/
│   │       └── index.ts                 # Shared types
│   ├── Dockerfile
│   ├── docker-compose.yml               # Full stack (frontend + backend)
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── e2e/
│   ├── tests/
│   │   ├── home.spec.ts                 # Homepage tests
│   │   ├── backend-communication.spec.ts # API integration tests
│   │   ├── error.spec.ts                # Error handling tests
│   │   ├── responsive.spec.ts           # Responsive design tests
│   │   └── smoke.spec.ts                # Smoke tests
│   ├── fixtures/                         # Test fixtures (empty)
│   ├── Dockerfile
│   ├── playwright.config.ts
│   ├── docker-compose.yml               # Images from GHCR
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 3. Backend API (Fastify)

### Endpoints

| Method | Path              | Description                | Response                   |
|--------|-------------------|----------------------------|----------------------------|
| GET    | `/articles`       | List all articles          | `Article[]`                |
| GET    | `/articles/:slug` | Get article by slug        | `Article` or 404           |
| GET    | `/topics`         | List unique topics         | `Topic[]`                  |
| GET    | `/health`         | Health check               | `{ status, timestamp }`    |

### Data Model

```typescript
interface Article {
  id: number;
  slug: string;      // URL-friendly identifier
  title: string;     // Article title
  content: string;   // Full markdown content
  topic: string;     // Topic category (e.g. "Docker", "Testing")
}

interface Topic {
  name: string;
  slug: string;
  description: string;
}
```

### In-Memory Articles (13 total)

| ID | Slug | Topic |
|----|------|-------|
| 1 | `what-is-multi-project-pipeline` | Introduction |
| 2 | `why-use-multi-project-pipelines` | Introduction |
| 3 | `monorepo-vs-multi-repo` | Architecture |
| 4 | `github-actions-implementation` | GitHub Actions |
| 5 | `gitlab-multi-project-pipelines` | GitLab |
| 6 | `docker-images` | Docker |
| 7 | `docker-compose` | Docker |
| 8 | `playwright` | Testing |
| 9 | `integration-testing` | Testing |
| 10 | `consumer-driven-contracts` | Testing |
| 11 | `advantages` | Analysis |
| 12 | `disadvantages` | Analysis |
| 13 | `best-practices` | Analysis |

### Code Organization

```
src/
├── routes/         # HTTP route definitions → Fastify plugin
├── controllers/    # Request/response handlers → extract params, call services
├── services/       # Business logic → operate on data
├── data/           # In-memory data store → static arrays
└── types/          # TypeScript interfaces → shared types
```

Each layer has a single responsibility and depends only on the layer below it.

### Entry Point (`src/index.ts`)

```typescript
import Fastify from "fastify";
import cors from "@fastify/cors";
import { articleRoutes } from "./routes/articleRoutes";

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, { origin: "*" });
  await app.register(articleRoutes);

  const port = parseInt(process.env.PORT || "3001", 10);
  const host = process.env.HOST || "0.0.0.0";

  await app.listen({ port, host });
}

start();
```

---

## 4. Frontend (Next.js)

### Pages

| Route | File | Type | Description |
|-------|------|------|-------------|
| `/` | `app/page.tsx` | Dynamic (SSR) | Hero section + topic grid |
| `/articles/[slug]` | `app/articles/[slug]/page.tsx` | Dynamic (SSR) | Article content |
| `/_not-found` | `app/not-found.tsx` | Static | 404 page |
| Error boundary | `app/error.tsx` | Client | Error UI with retry |
| Loading | `app/loading.tsx` | Static | Loading spinner |

### Data Fetching

The frontend uses **server-side rendering** with `force-dynamic` to fetch data
from the backend API on every request:

```typescript
// src/services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function getArticles(): Promise<Article[]> {
  return fetchJson<Article[]>("/articles");
}

export function getArticleBySlug(slug: string): Promise<Article> {
  return fetchJson<Article>(`/articles/${slug}`);
}
```

### TailwindCSS v4

The project uses TailwindCSS v4 with the new `@import "tailwindcss"` syntax
(instead of the old `@tailwind` directives). Styling is applied entirely through
utility classes — no custom CSS files.

### Component: TopicCard

Each topic card has a color-coded left border based on its category:

```typescript
const topicColors: Record<string, string> = {
  Introduction:   "border-l-blue-500 bg-blue-50",
  Architecture:   "border-l-emerald-500 bg-emerald-50",
  "GitHub Actions": "border-l-orange-500 bg-orange-50",
  GitLab:         "border-l-purple-500 bg-purple-50",
  Docker:         "border-l-cyan-500 bg-cyan-50",
  Testing:        "border-l-rose-500 bg-rose-50",
  Analysis:       "border-l-amber-500 bg-amber-50",
};
```

---

## 5. Docker & Docker Compose

### Dockerfiles

**Backend** (`backend/Dockerfile`):

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

**Frontend** (`frontend/Dockerfile`):

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

**E2E** (`e2e/Dockerfile`):

```dockerfile
FROM mcr.microsoft.com/playwright:v1.51.0-focal
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npx", "playwright", "test"]
```

### Docker Compose Files

**Frontend Compose** (`frontend/docker-compose.yml`) — Full stack:

```yaml
services:
  backend:
    build: ../backend
    ports: ["3001:3001"]
    environment:
      - PORT=3001
      - HOST=0.0.0.0
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://127.0.0.1:3001/health"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s

  frontend:
    build: .
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://127.0.0.1:3000"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 15s
```

**Backend Compose** (`backend/docker-compose.yml`) — Backend standalone:

```yaml
services:
  backend:
    build: .
    ports: ["3001:3001"]
    environment:
      - PORT=3001
      - HOST=0.0.0.0
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://127.0.0.1:3001/health"]
```

**E2E Compose** (`e2e/docker-compose.yml`) — For integration tests:

```yaml
services:
  backend:
    image: ghcr.io/joaogomeshai/backend-lab:latest
    ports: ["3001:3001"]
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://127.0.0.1:3001/health"]

  frontend:
    image: ghcr.io/joaogomeshai/frontend-lab:latest
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      backend:
        condition: service_healthy
```

### Running Locally

```bash
# Start full stack
docker compose -f frontend/docker-compose.yml up --build -d

# Run backend alone
docker compose -f backend/docker-compose.yml up --build -d

# Run E2E tests against running stack
cd e2e
npm install
npx playwright test
```

---

## 6. E2E Testing (Playwright)

### Test Structure

```
e2e/tests/
├── home.spec.ts                # Homepage: title, topics, navigation
├── backend-communication.spec.ts  # API integration from browser
├── error.spec.ts               # 404 and error pages
├── responsive.spec.ts          # Desktop, tablet, mobile viewports
└── smoke.spec.ts               # Core smoke tests
```

### Test Scenarios (16 tests total)

| File | Test | What it validates |
|------|------|-------------------|
| `home.spec.ts` | homepage loads and shows title | Hero title visible |
| `home.spec.ts` | topics are visible | Topic cards render |
| `home.spec.ts` | navigation works for every topic | All links work |
| `backend-communication.spec.ts` | articles are rendered from API | API returns data |
| `backend-communication.spec.ts` | article page loads from API data | Article page renders |
| `error.spec.ts` | shows error for non-existent article | 404 handled |
| `error.spec.ts` | shows error for non-existent route | 404 handled |
| `responsive.spec.ts` | homepage on desktop/tablet/mobile | 3 viewport tests |
| `responsive.spec.ts` | article page on desktop/tablet/mobile | 3 viewport tests |
| `smoke.spec.ts` | homepage loads successfully | HTTP 200 |
| `smoke.spec.ts` | article page loads successfully | HTTP 200 |
| `smoke.spec.ts` | navigation between pages works | Back button |

### Playwright Configuration

```typescript
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

**Key decisions:**
- Only Chromium (no Firefox/WebKit) to minimize CI time
- `retries: 2` in CI to handle flakiness
- Screenshots and traces captured on failure for debugging

---

## 7. CI/CD — GitHub Actions

### Repository Setup

Each repository (`frontend-lab`, `backend-lab`, `e2e-flowts-lab`) has its own
workflow file in `.github/workflows/`:

| Repo | Workflow File | Jobs |
|------|---------------|------|
| `frontend-lab` | `frontend.yml` | type-check, build, docker, trigger-integration |
| `backend-lab` | `backend.yml` | lint, test, docker, trigger-integration |
| `e2e-flowts-lab` | `integration.yml` | e2e (Playwright) |

### Trigger Events

All workflows trigger on:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

Additionally, `frontend.yml` and `backend.yml` listen for:

```yaml
  repository_dispatch:
    types: [cross-repo-wakeup]
```

And `integration.yml` listens for:

```yaml
  repository_dispatch:
    types: [integration-tests]
```

### Frontend Pipeline (`frontend.yml`)

```
Pull Request / Push to main
         │
         ▼
    ┌─────────┐
    │ Type    │   npx tsc --noEmit
    │ Check   │
    └────┬────┘
         │ (if failed → ❌ block PR)
         ▼
    ┌─────────┐
    │ Build   │   next build
    └────┬────┘
         │ (if failed → ❌ block PR)
         ▼
    ┌─────────┐
    │ Docker  │   Build & push to GHCR
    │         │   Tags: ${{ github.sha }}, pr-<number> / latest
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ Trigger │   Parse PR body for cross-repo-dependency
    │ Integr. │   → if active dep: check GHCR for dep image
    └─────────┘   → if ready: dispatch to e2e-flowts-lab
                  → if not: set ⏳ pending on PR
                  → if wait_for: send wakeup to active PR
```

### Backend Pipeline (`backend.yml`)

Same structure as frontend but with `lint` and `test` instead of `type-check`.

```
Lint → Test → Docker → Trigger Integration
```

### Integration Pipeline (`integration.yml`)

Triggered by `repository_dispatch` from frontend or backend:

```
Receive Dispatch
      │
      ▼
┌──────────────┐
│ Log in to    │   docker/login-action → GHCR
│ GHCR         │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Create       │   docker-compose.override.yml with
│ Override     │   PR-specific image tags
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Start        │   docker compose up -d
│ Services     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Wait for     │   Health check endpoints
│ Health       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Run          │   npx playwright install chromium
│ Playwright   │   npx playwright test
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Report       │   Set e2e/integration status on
│ Status       │   ALL upstream PRs
└──────────────┘
```

### Status Reporting

The integration pipeline reports `e2e/integration` commit status to **every**
repo listed in the `upstreams` payload:

```yaml
- name: Report status to upstream(s)
  if: always() && env.UPSTREAMS != ''
  run: |
    jq -c '.[]' <<< "$UPSTREAMS" | while read -r upstream; do
      REPO=$(echo "$upstream" | jq -r '.repo')
      SHA=$(echo "$upstream" | jq -r '.sha')
      gh api "repos/$REPO/statuses/$SHA" \
        -f state="$STATE" \
        -f context="e2e/integration" \
        -f description="$DESC"
    done
```

---

## 8. CI/CD — GitLab CI

Each repo has an equivalent `.gitlab-ci.yml`:

| Repo | File |
|------|------|
| `frontend-lab` | `.gitlab-ci.yml` |
| `backend-lab` | `.gitlab-ci.yml` |
| `e2e-flowts-lab` | `.gitlab-ci.yml` |

### Key Differences from GitHub Actions

| Feature | GitHub Actions | GitLab CI |
|---------|---------------|-----------|
| Multi-project | Repository dispatch + PAT | Native `trigger` keyword |
| Pipeline graph | Separate per repo | Unified graph |
| Auth | PAT with `repo` scope | CI/CD tokens |
| Status reporting | `gh api .../statuses/...` | Built-in pipeline status |
| Cross-repo wait | Manual polling | `strategy: depend` |
| Reusable configs | Reusable workflows | Templates (`!reference`) |

### GitLab Multi-Project Trigger

```yaml
# .gitlab-ci.yml (frontend)
trigger-integration:
  stage: trigger
  trigger:
    project: myorg/e2e-tests
    branch: main
    strategy: depend
  variables:
    FRONTEND_IMAGE: $REGISTRY/$CI_PROJECT_PATH/frontend:$CI_COMMIT_SHA
    BACKEND_IMAGE: $REGISTRY/myorg/backend-lab:latest
```

The `strategy: depend` keyword makes GitLab wait for the downstream pipeline
and propagate its result back — no polling needed.

---

## 9. Cross-Repo Dependency Coordination

### The Problem

When two PRs from different repositories depend on each other (e.g., frontend
adds a feature that requires a new backend API), they must be tested together.
Running E2E separately against `latest` would test incompatible versions.

### The Solution: Explicit Declarations

Each PR declares its role in the PR **body** (description):

```markdown
## Active PR (triggers E2E):
cross-repo-dependency: joaogomeshai/backend-lab/1

## Passive PR (sends wakeup):
cross-repo-dependency: wait_for:joaogomeshai/frontend-lab/2
```

### Formats

| Format | Role | Behavior |
|--------|------|----------|
| `owner/repo/PR-number` | **Active** | Checks if dep image exists in GHCR → dispatches E2E with both images |
| `wait_for:owner/repo/PR-number` | **Passive** | Sets pending on itself → sends wakeup dispatch to active repo |
| (no line) | **Independent** | Dispatches E2E with `latest` for other service |
| Invalid format | **Independent** | Treated as no dependency (dispatches with `latest`) |

### The Dispatch Flow

```
               ┌───────────────────┐
               │ Backend PR #1     │
               │ wait_for:front/2  │
               └────────┬──────────┘
                        │
                  1. Build image pr-1
                  2. Detect wait_for
                  3. Set ⏳ pending on itself
                  4. Send wakeup to frontend-lab
                        │
                        ▼
               ┌───────────────────┐
               │ Frontend PR #2    │
               │ dep: backend/1    │
               └────────┬──────────┘
                        │
              ┌─────────┴──────────┐
              │                    │
         (PR push)          (wakeup received)
              │                    │
         Build image pr-2    Re-check backend pr-1
         Check backend pr-1  → image exists
         → image exists      → dispatch E2E
         → dispatch E2E      → report to both PRs
              │                    │
              └─────────┬──────────┘
                        │
                        ▼
               ┌───────────────────┐
               │ E2E Pipeline      │
               │ Tests both images │
               │ together          │
               └────────┬──────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌──────────────┐       ┌──────────────┐
    │ Frontend PR  │       │ Backend PR   │
    │ e2e/ ✅      │       │ e2e/ ✅      │
    │ Can merge    │       │ Can merge    │
    └──────────────┘       └──────────────┘
```

### GHCR Authentication

GitHub Container Registry requires an OAuth2 token for manifest inspection:

```bash
# Get a pull token
GHCR_TOKEN=$(curl -s "https://ghcr.io/token?service=ghcr.io&scope=repository:$REPO:pull" \
  -u "oauth2:${{ secrets.GH_PAT }}" | jq -r '.token')

# Check if a tag exists
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $GHCR_TOKEN" \
  "https://ghcr.io/v2/$REPO/manifests/$TAG")
```

### Required Secrets

| Secret | Repos | Scope |
|--------|-------|-------|
| `GH_PAT` | frontend-lab, backend-lab, e2e-flowts-lab | `repo` (full control) |

The PAT is used for:
1. Cross-repo `repository_dispatch` events
2. Setting commit statuses on other repos
3. Getting OAuth2 tokens from GHCR

---

## 10. Branch Protection

### Rules Applied (Main Branch)

| Repo | Required Status Checks |
|------|----------------------|
| `frontend-lab` | `type-check`, `build`, `e2e/integration` |
| `backend-lab` | `lint`, `test`, `e2e/integration` |
| `e2e-flowts-lab` | `e2e` |

### How It Prevents Bad Merges

```
Developer opens PR → pipeline runs
  ├─ type-check fails → ❌ blocked
  ├─ build fails → ❌ blocked
  ├─ e2e/integration ➖ pending → ⏳ waiting
  ├─ e2e/integration ✅ pass → ✅ can merge
  └─ e2e/integration ❌ fail → ❌ must fix
```

For **cross-repo PRs**:

```
Frontend PR has: cross-repo-dependency: backend/1

  ├─ Backend PR not ready → e2e/integration ⏳ pending → blocked
  └─ Backend PR ready → E2E runs → reports to both PRs → unblocked
```

### Why E2E Doesn't Re-Run on Main Push

When a PR merges, the resulting push to `main` does NOT dispatch to e2e.
The reasoning: the merge commit is identical to what was tested on the PR.
Re-running E2E against `latest` (which might be stale) would only cause false
failures in cross-repo scenarios.

---

## 11. Pipeline Flow Diagrams

### Single PR Change

```
Frontend PR #1 (no dependency)
         │
         ▼
┌─────────────────────┐
│ Build Docker Image  │
│ Tag: pr-1           │
│ Push to GHCR        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ No dependency line  │
│ Use backend:latest  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Dispatch to e2e     │
│ frontend: pr-1      │
│ backend: latest     │
│ upstreams: [front]  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ E2E runs 16 tests   │
│ Report ✅ to front  │
│ Merge unblocked     │
└─────────────────────┘
```

### Cross-Repo PR Change

```
Frontend PR #2 (active)         Backend PR #1 (passive)
    │                                │
    ▼                                ▼
┌──────────────┐              ┌──────────────┐
│ Build image  │              │ Build image  │
│ pr-2         │              │ pr-1         │
└──────┬───────┘              └──────┬───────┘
       │                             │
       ▼                             ▼
┌──────────────┐              ┌──────────────┐
│ Check dep    │              │ See          │
│ backend/1    │              │ wait_for:     │
│ image exists?│              │ frontend/2    │
└──────┬───────┘              └──────┬───────┘
       │                             │
       │ YES                         │ Set ⏳ pending
       ▼                             │ Send wakeup
┌──────────────┐                     │ to frontend
│ Dispatch E2E │                     ▼
│ with both    │              (waiting for E2E report)
│ images       │
│ Report to    │
│ both PRs     │
└──────┬───────┘
       │
       ▼
┌─────────────────────┐
│ E2E runs 16 tests   │
│ Report ✅ to both   │
│ Both PRs unblocked  │
└─────────────────────┘
```

### Wakeup Sequence (if passive PR opens first)

```
1. Backend PR #1 opens (passive)
   → Sees wait_for:frontend/2
   → Backend image pr-1 not in GHCR yet (build running)
   → Sets ⏳ pending
   → Sends wakeup to frontend-lab

2. Frontend receives wakeup (repository_dispatch)
   → Fetches PR #2 body → dep: backend/1
   → Checks backend pr-1 → 404 (not built yet)
   → Exits (nothing to do)

3. Backend PR finishes building image pr-1
   → Pipeline triggers again (on push)
   → Sees wait_for:frontend/2
   → Sends wakeup to frontend-lab (again)

4. Frontend receives wakeup (again)
   → Checks backend pr-1 → 200 (ready!)
   → Dispatches E2E with both images
   → E2E runs → reports to both PRs
```

---

## 12. Complete File Reference

### Backend (11 files)

| File | Lines | Purpose |
|------|-------|---------|
| `package.json` | 22 | Dependencies: fastify, cors |
| `tsconfig.json` | 18 | TypeScript config |
| `Dockerfile` | 15 | Multi-stage Docker build |
| `docker-compose.yml` | 18 | Backend standalone |
| `src/index.ts` | 26 | App entry, register routes |
| `src/data/articles.ts` | 348 | 13 in-memory articles |
| `src/types/index.ts` | 8 | TypeScript interfaces |
| `src/services/articleService.ts` | 24 | Business logic |
| `src/controllers/articleController.ts` | 31 | HTTP handlers |
| `src/routes/articleRoutes.ts` | 10 | Route definitions |
| `src/__tests__/articleService.test.ts` | 26 | 4 unit tests |
| `.github/workflows/backend.yml` | ~175 | CI/CD pipeline |
| `.gitlab-ci.yml` | ~40 | GitLab CI equivalent |

### Frontend (17 files)

| File | Lines | Purpose |
|------|-------|---------|
| `package.json` | 24 | Dependencies: next, react, tailwindcss |
| `tsconfig.json` | 23 | TypeScript config with path aliases |
| `next.config.ts` | 7 | Standalone output for Docker |
| `postcss.config.mjs` | 6 | PostCSS with TailwindCSS v4 |
| `Dockerfile` | 14 | Multi-stage Docker build |
| `docker-compose.yml` | 35 | Full stack (frontend + backend) |
| `src/app/globals.css` | 1 | `@import "tailwindcss"` |
| `src/app/layout.tsx` | 31 | Root layout with nav |
| `src/app/page.tsx` | 54 | Homepage with hero + topic grid |
| `src/app/not-found.tsx` | 14 | 404 page |
| `src/app/error.tsx` | 22 | Error boundary |
| `src/app/loading.tsx` | 7 | Loading state |
| `src/app/articles/[slug]/page.tsx` | 40 | Article detail page |
| `src/components/TopicCard.tsx` | 35 | Topic card with colors |
| `src/services/api.ts` | 20 | Fetch API client |
| `src/types/index.ts` | 12 | Shared types |
| `.github/workflows/frontend.yml` | ~200 | CI/CD pipeline |
| `.gitlab-ci.yml` | ~40 | GitLab CI equivalent |

### E2E (11 files)

| File | Lines | Purpose |
|------|-------|---------|
| `package.json` | 16 | Dependencies: playwright, typescript |
| `tsconfig.json` | 14 | TypeScript config |
| `playwright.config.ts` | 29 | Playwright config |
| `Dockerfile` | 8 | Playwright Docker image |
| `docker-compose.yml` | 28 | Images from GHCR |
| `tests/home.spec.ts` | 40 | 3 homepage tests |
| `tests/backend-communication.spec.ts` | 22 | 2 API tests |
| `tests/error.spec.ts` | 17 | 2 error tests |
| `tests/responsive.spec.ts` | 42 | 6 responsive tests |
| `tests/smoke.spec.ts` | 23 | 3 smoke tests |
| `.github/workflows/integration.yml` | ~90 | E2E pipeline |
| `.gitlab-ci.yml` | ~40 | GitLab CI equivalent |

### Documentation (6 files)

| File | Lines | Purpose |
|------|-------|---------|
| `docs/index.md` | ~70 | Documentation index |
| `docs/01-why-multi-project-pipelines.md` | ~40 | Concept explanation |
| `docs/02-why-e2e-in-its-own-repository.md` | ~40 | Architecture decision |
| `docs/03-github-vs-gitlab.md` | ~60 | Platform comparison |
| `docs/04-docker-workflow.md` | ~50 | Docker image strategy |
| `docs/05-downstream-pipelines.md` | ~60 | Pipeline chaining |

---

## Running the Project

### Local Development (without Docker)

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# → http://localhost:3001

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Local Development (with Docker)

```bash
# Full stack
docker compose -f frontend/docker-compose.yml up --build -d

# Backend only
docker compose -f backend/docker-compose.yml up --build -d

# View logs
docker compose -f frontend/docker-compose.yml logs -f

# Stop
docker compose -f frontend/docker-compose.yml down -v
```

### Running E2E Tests

```bash
# Start the stack first, then:
cd e2e
npm install
npx playwright install chromium
npx playwright test              # headless
npx playwright test --headed     # with browser
npx playwright test --ui         # interactive UI
```

### Creating GitHub Repositories

Each folder is structured to be its own Git repository:

```bash
# For each folder:
cd frontend   # or backend, e2e
git init
git add -A
git commit -m "Initial commit"
git remote add origin git@github.com:your-org/your-repo.git
git push -u origin main
```

Then configure:
1. Secrets: `GH_PAT` in all 3 repos
2. Branch protection: required status checks
3. GitHub Actions: enabled (default)

---

## Glossary

| Term | Definition |
|------|------------|
| **Multi-Project Pipeline** | A CI/CD architecture where multiple independent repositories coordinate through cross-repository triggers |
| **Repository Dispatch** | GitHub Actions mechanism to trigger a workflow in another repository |
| **Cross-Repo Dependency** | A declared relationship between PRs in different repositories that must be tested together |
| **Downstream Pipeline** | A pipeline triggered by an upstream pipeline (e.g., e2e triggered by frontend) |
| **GHCR** | GitHub Container Registry — stores Docker images alongside code |
| **Status Check** | A commit-level check (✅/❌/⏳) that branch protection rules use to block or allow merges |
| **Upstream** | In E2E reporting, the PR that triggered the integration tests and needs to receive the result |
| **wait_for** | A passive cross-repo role that sets pending and sends a wakeup to the active PR |
| **Active PR** | The PR responsible for checking dependencies and dispatching E2E |
| **Passive PR** | The PR that waits for the active PR to coordinate E2E |

---

> **Multi-Project Pipeline Lab — Version 1.0**
>
> Built with TypeScript, Next.js, Fastify, Playwright, Docker, and GitHub Actions.
>
> The goal is not to be production-ready. The goal is to understand.
