import { Article } from "../types";

export const articles: Article[] = [
  {
    id: 1,
    slug: "what-is-multi-project-pipeline",
    title: "What is a Multi-Project Pipeline",
    content: `A multi-project pipeline is a CI/CD architecture where multiple independent repositories are orchestrated to work together as part of a larger delivery process.

Instead of having a single monolithic pipeline that builds, tests, and deploys everything, multi-project pipelines allow you to break down the process into smaller, focused pipelines that can be triggered based on events from other pipelines.

This approach is particularly useful when:
- Different teams own different services
- Services have different release cycles
- You want to reuse pipeline components across projects
- You need to maintain clear ownership boundaries

Both GitHub Actions and GitLab CI support multi-project pipelines, though they implement them differently.`,
    topic: "Introduction",
  },
  {
    id: 2,
    slug: "why-use-multi-project-pipelines",
    title: "Why use Multi-Project Pipelines",
    content: `Multi-project pipelines solve several key problems in modern software development:

1. **Separation of Concerns** — Each repository has its own pipeline focused on its specific domain. The frontend pipeline builds and tests the frontend; the backend pipeline builds and tests the backend.

2. **Independent Release Cycles** — Teams can release their services independently without waiting for other teams to be ready.

3. **Clear Ownership** — Each pipeline belongs to a specific team, making it clear who is responsible for failures.

4. **Reduced Complexity** — Smaller, focused pipelines are easier to understand, debug, and maintain than a single giant pipeline.

5. **Faster Feedback** — Teams get feedback on their changes faster because they don't have to wait for unrelated parts of the system to build.

6. **Scalability** — As your organization grows, multi-project pipelines scale better than monorepo pipelines.`,
    topic: "Introduction",
  },
  {
    id: 3,
    slug: "monorepo-vs-multi-repo",
    title: "Monorepo vs Multi-Repo",
    content: `The choice between monorepo and multi-repo architectures affects everything from development workflows to CI/CD design.

**Monorepo**
- All code in a single repository
- Easier code sharing and refactoring
- Atomic commits across the entire system
- Single CI/CD configuration
- Can become slow and complex at scale

**Multi-Repo**
- Each service in its own repository
- Clear ownership boundaries
- Independent release cycles
- Multi-project pipelines needed for orchestration
- More complex cross-repository changes

**Which one should you choose?**
There is no universal answer. Many organizations start with a monorepo and move to multi-repo as they grow. The key is understanding the tradeoffs and choosing the right tool for your context.

This lab uses a multi-repo structure to demonstrate multi-project pipelines.`,
    topic: "Architecture",
  },
  {
    id: 4,
    slug: "github-actions-implementation",
    title: "GitHub Actions implementation",
    content: `GitHub Actions supports multi-project orchestration through several mechanisms:

**Repository Dispatch**
The frontend or backend pipeline can trigger a workflow in another repository using the repository dispatch event:

\`\`\`yaml
- name: Trigger Integration Tests
  run: |
    gh api repos/:owner/:repo/dispatches \\
      -f event_type=integration-tests \\
      -f client_payload[image_tag]=${{ github.sha }}
\`\`\`

**Reusable Workflows**
Share common workflow logic across repositories:

\`\`\`yaml
jobs:
  call-workflow:
    uses: owner/common/.github/workflows/docker-build.yml@main
    with:
      image_tag: ${{ github.sha }}
\`\`\`

**Workflow Dispatch**
Manually trigger workflows across repositories with parameterized inputs.

Each approach has different strengths. Repository dispatch is closest to GitLab's multi-project pipeline concept.`,
    topic: "GitHub Actions",
  },
  {
    id: 5,
    slug: "gitlab-multi-project-pipelines",
    title: "GitLab Multi-Project Pipelines",
    content: `GitLab has native support for multi-project pipelines through the trigger mechanism:

**Downstream Pipeline Trigger**
In your \`.gitlab-ci.yml\`, you can trigger a pipeline in another project:

\`\`\`yaml
trigger-integration:
  stage: deploy
  trigger:
    project: myorg/e2e-tests
    branch: main
    strategy: depend
  variables:
    IMAGE_TAG: $CI_COMMIT_SHA
\`\`\`

The \`strategy: depend\` keyword makes the downstream pipeline result propagate back to the upstream pipeline.

**Multi-Project Pipeline Visualization**
GitLab shows the relationship between pipelines across projects in a single unified view, making it easy to trace a build from frontend → backend → integration tests.

**Key Differences from GitHub Actions**
- GitLab has built-in multi-project pipeline support
- GitHub relies more on repository dispatch and reusable workflows
- GitLab provides a unified pipeline graph across projects
- GitHub's approach is more flexible but requires more manual configuration`,
    topic: "GitLab",
  },
  {
    id: 6,
    slug: "docker-images",
    title: "Docker images",
    content: `Docker images are the primary mechanism for sharing applications across environments in a multi-project pipeline.

**Why Docker?**
1. **Consistency** — The same image runs identically on a developer's machine, CI server, and production.
2. **Isolation** — Each service runs in its own container with its own dependencies.
3. **Versioning** — Images are tagged with versions, making it easy to roll back.
4. **Sharing** — Images are pushed to a registry and pulled by other pipelines.

**Image Tags**
A good tagging strategy is essential:
- \`git-sha\` — Unique, traceable identifier
- \`latest\` — Convenient but unreliable for production
- \`semver\` — Human-readable version

In this lab, images are built by individual pipelines and consumed by the integration pipeline:
1. Frontend pipeline builds → \`frontend:sha\`
2. Backend pipeline builds → \`backend:sha\`
3. Integration pipeline pulls both images for testing`,
    topic: "Docker",
  },
  {
    id: 7,
    slug: "docker-compose",
    title: "Docker Compose",
    content: `Docker Compose is used to define and run multi-container applications. In a multi-project pipeline context, Compose plays a critical role in integration testing.

**Why Docker Compose for Integration Testing?**
1. **Reproducible Environments** — The same Compose file works locally and in CI.
2. **Service Discovery** — Containers find each other by service name.
3. **Network Isolation** — Services communicate over a dedicated network.
4. **Health Checks** — Compose can wait for services to be healthy.

**In this Lab**
The infrastructure folder contains a docker-compose.yml that defines:
- \`frontend\` — Next.js application
- \`backend\` — Fastify API

The integration pipeline uses this same Compose file to spin up the full stack before running Playwright tests.

This approach ensures that the integration tests run against the exact same configuration that developers use locally.`,
    topic: "Docker",
  },
  {
    id: 8,
    slug: "playwright",
    title: "Playwright",
    content: `Playwright is a browser automation framework used for end-to-end testing.

**Why Playwright?**
1. **Cross-Browser** — Tests run on Chromium, Firefox, and WebKit.
2. **Auto-Waiting** — Elements are automatically waited for before actions.
3. **Network Interception** — Mock or wait for API calls.
4. **Mobile Emulation** — Test responsive designs.
5. **TypeScript Support** — First-class TypeScript support.

**In this Lab**
Playwright is in its own repository (\`e2e/\`) because:
1. E2E tests have different dependencies than the frontend.
2. E2E tests should run after both frontend and backend are built.
3. E2E tests represent the final quality gate before deployment.
4. Keeping E2E separate reinforces the multi-project pipeline concept.

The E2E project knows nothing about the frontend implementation. It only tests the running application through the browser.`,
    topic: "Testing",
  },
  {
    id: 9,
    slug: "integration-testing",
    title: "Integration Testing",
    content: `Integration testing verifies that different parts of the system work together correctly.

**In a Multi-Project Context**
Integration testing is the final validation step that brings everything together:

1. **Frontend Pipeline** — Builds and pushes frontend Docker image.
2. **Backend Pipeline** — Builds and pushes backend Docker image.
3. **Integration Pipeline** — Pulls both images, starts the stack with Docker Compose, runs end-to-end tests.

**What Integration Tests Cover**
- Frontend can communicate with backend
- API responses are correctly formatted
- Error states are handled gracefully
- The system works as a whole

**Why Separate the Integration Pipeline?**
The integration pipeline depends on artifacts from both the frontend and backend pipelines. By making it a separate pipeline, we can:
- Trigger it only when both artifacts are ready
- Track its status independently
- Re-run it without rebuilding services`,
    topic: "Testing",
  },
  {
    id: 10,
    slug: "consumer-driven-contracts",
    title: "Consumer Driven Contracts",
    content: `Consumer Driven Contracts (CDC) is a pattern where consumers define the interface they expect from a provider.

**How CDC Works**
1. The consumer (frontend) defines the contract — the API shape it expects.
2. The contract is shared with the provider (backend).
3. The provider validates its API against the contract.
4. Breaking changes are caught before deployment.

**CDC vs Multi-Project Pipelines**
CDC fits naturally into multi-project pipelines:
- The frontend pipeline can publish its contract.
- The backend pipeline can validate against it.
- If the contract is broken, the backend pipeline fails early.

**Tools**
- Pact is the most popular CDC framework
- Contract tests are faster and more focused than E2E tests
- They provide safety guarantees without the overhead of full integration testing

This lab does not implement CDC, but understanding the concept is key to designing robust multi-project pipelines.`,
    topic: "Testing",
  },
  {
    id: 11,
    slug: "advantages",
    title: "Advantages",
    content: `Multi-project pipelines offer several advantages over monolithic CI/CD architectures:

**1. Independent Deployments**
Teams can deploy their services independently without waiting for other teams or services to be ready.

**2. Focused Feedback**
When a pipeline fails, the owning team knows immediately. There is no noise from unrelated failures.

**3. Scalability**
As your organization grows, you can add more pipelines without increasing the complexity of any single pipeline.

**4. Reusability**
Pipeline components (Docker builds, linting, testing) can be shared across projects using reusable workflows or templates.

**5. Security**
Each pipeline has access only to the secrets it needs, reducing the blast radius of a compromised pipeline.

**6. Parallelism**
Multiple pipelines can run in parallel, reducing the overall time to validate a change.

**7. Clear Ownership**
Each pipeline maps to a team and a service, making ownership unambiguous.`,
    topic: "Analysis",
  },
  {
    id: 12,
    slug: "disadvantages",
    title: "Disadvantages",
    content: `Multi-project pipelines are not without challenges:

**1. Cross-Repository Changes**
A change that spans multiple repositories requires multiple PRs and coordinated merges.

**2. Complex Orchestration**
Coordinating pipelines across repositories requires additional tooling and configuration.

**3. Versioning** 
Ensuring compatible versions of services run together can be challenging without careful version management.

**4. Duplicated Configuration**
Common pipeline logic may need to be duplicated or synchronized across repositories.

**5. Visibility**
Tracing a change from frontend to backend to integration tests requires tooling that can cross repository boundaries.

**6. Latency**
Multi-project pipelines often take longer because they run sequentially rather than in a single unified pipeline.

**7. Dependency Hell**
Managing dependencies between services becomes more complex when each service has its own release cycle.

Understanding these disadvantages is essential for deciding whether multi-project pipelines are the right choice for your organization.`,
    topic: "Analysis",
  },
  {
    id: 13,
    slug: "best-practices",
    title: "Best Practices",
    content: `Here are best practices for implementing multi-project pipelines:

**1. Use Consistent Tooling**
Standardize on the same CI platform, Docker base images, and testing frameworks across all projects.

**2. Tag Images Meaningfully**
Use git SHAs or semantic versions for Docker image tags. Never rely solely on the \`latest\` tag.

**3. Keep Pipelines Focused**
Each pipeline should do one thing well. The frontend pipeline builds the frontend; the backend pipeline builds the backend.

**4. Fail Fast**
Validate changes as early as possible. Run linting and unit tests before building Docker images.

**5. Share Pipeline Logic**
Use reusable workflows (GitHub Actions) or templates (GitLab CI) to avoid duplicating common pipeline steps.

**6. Document Triggers**
Clearly document what triggers each pipeline and what artifacts it produces.

**7. Monitor Pipeline Health**
Track pipeline duration, failure rates, and flaky tests across all projects.

**8. Plan for Cross-Repo Changes**
Establish a workflow for changes that span multiple repositories, such as stack PRs or coordinated releases.

**9. Test Integration Early**
Don't wait until the end to test integration. Run integration tests as soon as compatible artifacts are available.

**10. Treat Pipelines as Code**
Version your CI/CD configuration alongside your application code. Review pipeline changes like code changes.`,
    topic: "Analysis",
  },
];
