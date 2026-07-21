# GitHub Actions vs GitLab CI

## How They Handle Multi-Project Pipelines

### GitLab CI (Native Support)

GitLab has built-in multi-project pipeline support through the `trigger` keyword:

```yaml
trigger-integration:
  trigger:
    project: myorg/e2e-tests
    branch: main
    strategy: depend
  variables:
    IMAGE_TAG: $CI_COMMIT_SHA
```

Key features:
- Native cross-project triggering
- `strategy: depend` propagates the downstream pipeline result back to the upstream
- Unified pipeline graph visualization across projects
- Variables are passed automatically to the downstream pipeline

### GitHub Actions (Repository Dispatch)

GitHub doesn't have native multi-project pipeline support. Instead, you use repository dispatch:

```yaml
- name: Trigger Integration Tests
  run: |
    gh api repos/:owner/:repo/dispatches \
      -f event_type=integration-tests \
      -f client_payload[image_tag]=${{ github.sha }}
```

Key features:
- Requires a Personal Access Token (PAT) with cross-repository access
- Payload is passed as `client_payload`
- No unified pipeline graph — you need to check each repository separately
- More flexible but requires more manual configuration

## Comparison Table

| Feature | GitLab CI | GitHub Actions |
|---------|-----------|---------------|
| Native multi-project | ✓ Built-in | ✗ Manual |
| Pipeline graph across projects | ✓ Unified view | ✗ Separate views |
| Cross-repo auth | Built-in | PAT required |
| Pipeline result propagation | `strategy: depend` | Manual |
| Flexibility | Constrained by model | Highly flexible |
| Learning curve | Steeper for multi-project | Simpler to start |

## Which Should You Choose?

- **GitLab** if you want built-in multi-project support with unified visibility.
- **GitHub** if you need more flexibility and don't mind the additional configuration.

Both approaches are valid. This lab provides examples for both so you can compare them directly.
