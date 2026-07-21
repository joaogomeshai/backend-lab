# Docker Workflow

## Why Docker?

Docker provides **consistency** across environments. The same image that passes tests in CI will run identically in production.

## Image Tags

Image tagging strategy is critical in multi-project pipelines:

```
registry.example.com/project/frontend:abc123def  # Git SHA — unique, traceable
registry.example.com/project/frontend:latest      # Latest — convenient, but unreliable
```

**Best practice**: Use the Git commit SHA as the image tag. It provides:
- Uniqueness — every build gets a unique tag
- Traceability — you can find the exact commit that produced an image
- Reproducibility — you can recreate any build

## How Images Flow Through the Pipeline

```
Frontend Repo                    Backend Repo
     |                               |
  Build Image                    Build Image
     |                               |
  Push to Registry               Push to Registry
     |                               |
     +-----------> E2E Repo <--------+
                       |
              Pull Images from Registry
                       |
                 Docker Compose Up
                       |
                 Run Playwright Tests
                       |
                 Publish Report
```

## Pipeline Steps

Each service pipeline follows this pattern:

1. **Lint** — Check code quality
2. **Test** — Run unit tests
3. **Build** — Compile the application
4. **Docker Build** — Create a Docker image
5. **Docker Push** — Push to a container registry
6. **Trigger Integration** — Tell the E2E pipeline that new images are available
