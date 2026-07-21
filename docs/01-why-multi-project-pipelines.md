# Why Multi-Project Pipelines Exist

## The Problem

In a traditional monolithic CI/CD setup, all the code lives in one repository and a single pipeline builds, tests, and deploys everything. This approach breaks down when:

- Multiple teams own different services
- Services have different release cycles
- A single pipeline becomes too slow and complex
- Teams need clear ownership boundaries

## The Solution

Multi-project pipelines allow each service to have its own focused pipeline. These pipelines communicate and coordinate to deliver a complete system.

## How This Lab Demonstrates It

This lab has three independent "repositories" (currently folders):

1. **frontend/** — Owns the Next.js application. Its pipeline: lint → test → build → docker → trigger integration.
2. **backend/** — Owns the Fastify API. Its pipeline: lint → test → docker → trigger integration.
3. **e2e/** — Owns the Playwright tests. Its pipeline: receives images → compose up → run tests → publish report.

Each pipeline is independent. Changes to the frontend only trigger the frontend pipeline. But when both produce new Docker images, they trigger the integration pipeline that validates the system as a whole.

## Key Insight

Multi-project pipelines trade **simplicity of coordination** for **clarity of ownership**. Each team can work independently, but you need tooling to orchestrate the cross-repository workflows.
