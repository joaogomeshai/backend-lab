# How Downstream Pipelines Work

## The Concept

A downstream pipeline is triggered by an upstream pipeline. The result of the downstream pipeline can propagate back to the upstream pipeline.

## In GitLab CI

```yaml
# Upstream pipeline (frontend/.gitlab-ci.yml)
trigger-integration:
  stage: trigger
  trigger:
    project: myorg/e2e-tests
    branch: main
    strategy: depend
```

With `strategy: depend`, the upstream pipeline waits for the downstream pipeline to complete. If the downstream pipeline fails, the upstream pipeline also fails.

## In GitHub Actions

```yaml
# Upstream pipeline (frontend.yml)
trigger-integration:
  steps:
    - name: Trigger Integration Tests
      run: |
        gh api repos/${{ github.repository_owner }}/e2e-tests/dispatches \
          -f event_type=integration-tests
```

GitHub Actions does not have a native "depend" mechanism. You need to:
1. Use repository dispatch to trigger the downstream workflow
2. Poll for the result, or
3. Use a webhook to notify the upstream workflow of completion

## The Pipeline Chain

```
Frontend Pipeline ──┐
                    ├──> Integration Pipeline (E2E)
Backend Pipeline  ──┘
```

Both frontend and backend pipelines trigger the same integration pipeline. The integration pipeline runs only when both images are available.

## Why This Matters

Downstream pipelines enable:
- **Independent validation** — Each team validates their own changes first
- **Cross-team quality gates** — Integration tests ensure the system works as a whole
- **Clear failure ownership** — If the frontend pipeline triggers integration and it fails, the frontend team investigates
