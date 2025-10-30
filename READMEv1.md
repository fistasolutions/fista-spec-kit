# FISTA SPEC KIT — Project Specification Workflow
> A lightweight, AI-assisted Spec & SDLC orchestration system for Cursor, Claude, and Gemini developers.

Bringing clarity, structure, and speed to modern AI-driven software projects.

---

## 2️⃣ Visual Workflow Diagram

**Spec Kit Workflow (Feature Life Cycle)**

```mermaid
graph TD
  A[/constitution<br>Project principles & standards/] --> B[/specify<br>Define what to build (no technical info)/]
  B --> C[/clarify<br>Follow-up questions/]
  C --> D[/plan<br>Implementation plan/]
  D --> E[/tasks<br>Break plan into actionable steps/]
  E --> F[/analyze<br>Validate docs/]
  F --> G[/implement<br>Execute tasks & test/]
```

In SDLC terms:
- Requirements are captured in `specify`, refined in `clarify`.
- Solution design is produced in `plan`, operationalized in `tasks`.
- Validation occurs in `analyze`, and delivery happens in `implement`.

<details>
<summary>ASCII view (click to expand)</summary>

```
┌─────────────┐    ┌─────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌─────────┐    ┌────────────┐
│ constitution│ -> │ specify │ -> │ clarify│ -> │ plan   │ -> │ tasks  │ -> │ analyze │ -> │ implement  │
│ Principles  │    │ What    │    │ Remove │    │ How    │    │ Actions│    │ Validate│    │ Build/Test │
└─────────────┘    └─────────┘    └────────┘    └────────┘    └────────┘    └─────────┘    └────────────┘
```

</details>

---

## 3️⃣ 📘 What is Spec Kit?

Spec Kit is a structured toolchain for defining, planning, analyzing, and implementing features with AI-assisted agents. It provides a repeatable, documented workflow that guides each feature from idea to working software.

It enforces a consistent lifecycle across every feature: Specify → Clarify → Plan → Tasks → Analyze → Implement. Each phase is captured as living documentation and is machine-readable for agent automation.

By anchoring work to a project constitution, Spec Kit removes guesswork, codifies standards, and makes the development process inspectable, auditable, and reproducible.

---

## 4️⃣ 💡 Why is it Needed?

- Teams often waste time on vague specs, shifting requirements, and unclear acceptance criteria.
- Spec Kit introduces a living documentation system where each phase has artifacts that guide humans and AI consistently.
- It aligns developers, product managers, and AI agents via reproducible workflows, improving consistency, velocity, and accountability.

---

## 5️⃣ ⚙️ Main Components

- `/constitution` → project principles & standards
- `/specify` → feature definitions (non-technical)
- `/plan` → implementation planning
- `/tasks` → action breakdown
- `/analyze` → validation layer
- `/implement` → build & test

How AI models integrate:
- **Claude** excels at structured reasoning for `specify`, `clarify`, and `analyze`.
- **Cursor** (IDE + agent) accelerates `plan`, `tasks`, and `implement` inside your editor.
- **Gemini** supports cross-checking plans and generating alternative designs or tests.

---

## 6️⃣ 🧱 SDLC Mapping

| SDLC Stage | Spec Kit Equivalent | Purpose |
|-------------|--------------------|----------|
| Requirements Gathering | /specify | Define what to build |
| Analysis | /clarify | Remove ambiguities |
| Design | /plan | Architect solution |
| Implementation | /tasks & /implement | Build and test |
| Validation | /analyze | Ensure compliance |

> “Spec Kit makes SDLC executable by AI agents.”

---

## 7️⃣ 🧩 Setup & Installation

<details>
<summary>Step 1: Create GitHub Project</summary>

```bash
git init
gh repo create fista-spec-kit --public
git clone https://github.com/fistasolutions/fista-spec-kit.git
```

</details>

<details>
<summary>Step 2: Create Next.js App</summary>

```bash
npx create-next-app@latest .
npm run dev
```

</details>

<details>
<summary>Step 3: Install Spec Kit</summary>

```bash
uvx --from git+https://github.com/fistasolutions/fista-spec-kit.git \
  specify init .
```

</details>

<details>
<summary>Step 4: Add AI Models</summary>

**Paid Models**
- Cursor → `https://github.com/openai/codex`
- Claude → `https://docs.claude.com/en/docs/claude-code/setup`

**Free Models**
- Gemini → `https://github.com/google-gemini/gemini-cli`
- Qwen → [Add official repo link once available]

Select “All Yes” when prompted.

</details>

---

## 8️⃣ 🧠 After Installation

The `.specify` folder contains:
- Memory storage for context persistence
- System definitions for each phase
- JSON & Markdown spec documents

Initialize inside Claude Code:

```bash
specify init
```

---

## 9️⃣ 🧩 Constitution & Commands

Run Constitution:

```bash
/constitution
```

➡️ “Write clean and modular code using Next.js 15 best practices.”

Run Specification:

```bash
/specify
```

Example prompt:

> “I would like to build a Basic expense tracking app (add, view, delete expenses). Track personal expenses with amount, date, category, and description. Simple dashboard showing recent expenses and basic totals. Do not implement user auth.”

---

## 🔄 10️⃣ Example Flow Summary

1. **Specify** → Define idea
2. **Clarify** → Resolve ambiguities
3. **Plan** → Create implementation strategy
4. **Tasks** → Assign actionable steps
5. **Analyze** → Validate specs
6. **Implement** → Build, execute, and test

> “This workflow removes guesswork, enforces modular thinking, and integrates seamlessly with Cursor and Claude for code generation.”

---

## 🧩 11️⃣ Example Use Case

**Example Project:** Basic Expense Tracker  
CRUD operations: Add, View, Delete Expenses  
Tech: Next.js (App Router, Route Handlers, Server Actions, LocalStorage)

Backend: Local file or memory persistence  
No user authentication (for simplicity).

---

## ✅ Final Notes

- Use clean folder structures: `/src/server`, `/src/app`, `/src/components`
- Always version-control your specifications.
- Keep Constitution and Feature docs updated.

---

Made with ❤️ for AI-assisted development teams.


