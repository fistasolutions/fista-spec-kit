---
description: Extract and document existing codebase features into SpecKit artifacts for reuse and extension.
---

## User Input

```text
$ARGUMENTS
```

If provided, treat `$ARGUMENTS` as a path (e.g., `./src`, `./apps/web`, `./apps/api`); otherwise default to `./src`.

## Goal

Convert an **existing codebase** into structured SpecKit artifacts by automatically scanning its components, routes, and APIs.  
This creates a reusable **baseline specification** that can be extended through `/specify`, analyzed via `/analyze`, and executed with `/implement`.

Use this command when onboarding legacy projects, merging external repos, or preparing for feature expansion.

---

## Inputs

- **path** *(string, default: ./src)* — Root folder to analyze.
- **openapi** *(optional string)* — Path to OpenAPI JSON if not in common locations.

---

## Steps

1. **Resolve Path**
   - Verify the provided `$ARGUMENTS` path exists.
   - Normalize slashes for cross-platform support.

2. **Discover Web Routes**
   - Glob: `app/**/{page,route}.{ts,tsx,js,jsx}`
   - Extract friendly URLs:
     - Strip `/app/` prefix and filename.
     - Normalize `/index` to `/`.
     - Keep dynamic `[id]` segments.

3. **Detect UI Components**
   - Search under `components/`, `ui/`, and `shared/` directories.
   - Identify component names from filenames.

4. **Collect API Endpoints**
   - Try loading OpenAPI JSON from:
     - `apps/api/openapi.json`
     - `public/openapi.json`
     - `<path>/openapi.json`
   - Parse endpoint `method`, `path`, and `summary`.

5. **Generate Artifacts (Non-Destructive)**
   - Create or update:
     - `packages/specs/active/extracted/spec.yaml`
     - `packages/specs/active/extracted/inventory.md`
     - `packages/specs/active/extracted/tasks.md`
   - Append rather than overwrite.
   - Include a timestamp for traceability.

6. **Summarize Findings**
   - Count total routes, components, and API endpoints.
   - Display summary in output:
     ```
     ✅ Extracted 18 routes, 7 components, 5 API endpoints.
     📝 Wrote: packages/specs/active/extracted/spec.yaml
     📝 Wrote: packages/specs/active/extracted/inventory.md
     📝 Updated: packages/specs/active/extracted/tasks.md
     ```

7. **Recommend Next Steps**
   - `/specify` — Define new features or extend existing specs.
   - `/plan` — Outline architecture and design approach.
   - `/tasks` — Generate actionable tasks from extracted data.
   - `/analyze` — Ensure cross-artifact consistency.
   - `/implement` — Begin execution under controlled checklists.

---

## Rules

- **Append-Only**: Never delete existing specs or docs.
- **Deterministic**: Same input = same output ordering.
- **Cross-Platform Safe**: Always normalize paths using `/`.
- **Constitution Awareness**: Respect all project constraints defined in `/constitution`. Flag conflicts but do not auto-resolve them.
- **Zero Source Edits**: Extraction inspects code only—no modifications allowed.

---

## Example Usage

```bash
/extract ./src
```

```bash
/extract ./apps/web
```

```bash
curl http://localhost:8000/openapi.json > apps/api/openapi.json
/extract ./apps/api
```

---

## Output

Produces:
- A structured `spec.yaml` listing routes, components, and APIs.
- A human-readable `inventory.md` with tables for review.
- A timestamped `tasks.md` checklist for reconciliation.

These serve as the **baseline foundation** for `/specify`, `/plan`, `/tasks`, and `/implement` flows.

---

## Summary

Use `/extract` to bring **existing code into the SpecKit ecosystem**.  
It bridges real code with SpecKit’s documentation model, enabling immediate use of the entire chain — **/specify → /plan → /tasks → /analyze → /implement** — without manual re-entry.
