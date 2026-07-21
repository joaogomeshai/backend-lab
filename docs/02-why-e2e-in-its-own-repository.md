# Why E2E Belongs in Its Own Repository

## Separate Concerns

End-to-end tests have different requirements than the frontend or backend:

- **Dependencies** — Playwright requires browser binaries, which the frontend doesn't need.
- **Runtime** — E2E tests need a full running stack (frontend + backend), not just the application code.
- **Trigger** — E2E tests should run after both frontend and backend are built and deployed.
- **Ownership** — The E2E suite is a quality gate that spans multiple teams.

## Pipeline Dependencies

In a multi-project pipeline architecture:

1. Frontend pipeline builds and pushes a Docker image.
2. Backend pipeline builds and pushes a Docker image.
3. **Only then** does the E2E pipeline run — pulling both images and testing them together.

If the E2E tests lived in the frontend repository, they would only run when the frontend changes, missing backend-only changes that could break the system.

## Independence

The E2E project knows **nothing** about the frontend implementation. It tests the running application through the browser. This means:

- Frontend implementation can be refactored without changing E2E tests.
- E2E tests can be written by a separate QA team if needed.
- The same E2E suite can test different versions of the application.
