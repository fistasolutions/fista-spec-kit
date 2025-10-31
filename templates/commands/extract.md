---
description: Inventory existing code and seed SpecKit artifacts without overwriting manual docs.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Run extraction**: Execute `pnpm speckit:extract ${INPUT_PATH}` (default INPUT_PATH: `./src` if not provided).

2. **Summarize results**: Read the generated files from `packages/specs/active/extracted/`:
   - `spec.yaml` - Structured inventory of routes, components, and API endpoints
   - `inventory.md` - Human-readable tables of discovered artifacts
   - `tasks.md` - Reconciliation checklist (append-only, timestamped)

3. **Present findings**:
   - Count of routes, components, and API endpoints discovered
   - Key paths and components identified
   - Any OpenAPI specs that were found and parsed

4. **Suggest next steps**:
   - Open a PR with these extraction artifacts
   - Use `/speckit.specify` to add new features on top of the existing codebase
   - Use `/speckit.tasks` to create action items for documentation updates
   - Use `/speckit.plan` to plan enhancements or modernizations

## Rules

- **Never delete existing docs**: The extract command is append-only where needed (tasks.md)
- **Produce small, reviewable diffs**: Keep changes focused and easy to review
- **Keep secrets out of outputs**: Do not include API keys, tokens, or sensitive data in generated artifacts
- **Idempotent operations**: Re-running the extract command updates YAML and appends to tasks.md

## Implementation Details

The `speckit:extract` command:

- Scans Next.js App Router: `app/**/{page,route}.{ts,tsx,js,jsx}`
- Detects React components in: `components/**`, `ui/**`, `shared/**`
- Attempts to load OpenAPI JSON from:
  - `apps/api/openapi.json`
  - `public/openapi.json`
  - `<INPUT_PATH>/openapi.json`
- Generates normalized web paths from file system paths
- Handles route groups `(group)` and index pages
- Works cross-platform (Windows/Mac/Linux path normalization)

## Example Usage

```bash
# Extract from default src directory
pnpm speckit:extract ./src

# Extract from a specific app directory
pnpm speckit:extract ./apps/web

# After generating OpenAPI spec
curl http://localhost:8000/openapi.json > apps/api/openapi.json && pnpm speckit:extract ./apps/api
```

