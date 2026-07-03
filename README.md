# OptiRoute

OptiRoute is a route optimization project (frontend + backend) that helps compute and display optimal routes for deliveries and trips. This repository contains a Java backend and a JavaScript frontend. Detailed developer and schema documentation can be found in OptiRoute_Guide.md and OptiRoute_Database_Schema.md.

## Table of contents
- [Quick start](#quick-start)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Small tasks (good first issues)](#small-tasks-good-first-issues)
- [How to pick a task](#how-to-pick-a-task)
- [Contributing guidelines](#contributing-guidelines)
- [Useful docs](#useful-docs)
- [Author](#author)

## Quick start
Prerequisites:
- Docker & Docker Compose (recommended)
- Node.js (for frontend development)
- Java (for backend development; see OptiRoute_Guide.md for exact version/build tool)

Recommended quick run (uses the included docker-compose.yml):

1. Copy environment variables if applicable: `cp .env.example .env` (if present).
2. Start services: `docker compose up --build`
3. Open the frontend at http://localhost:3000 (or the port defined in docker-compose)

For development workflows and detailed instructions, see `OptiRoute_Guide.md`.

## Tech stack
- Frontend: JavaScript, CSS
- Backend: Java
- Dev / infra: Docker, Docker Compose

## Repository layout
- `frontend/` - JavaScript frontend application
- `backend/` - Java backend service
- `docker-compose.yml` - development and local orchestration
- `OptiRoute_Guide.md` - full developer guide
- `OptiRoute_Database_Schema.md` - database schema and notes

## Small tasks (good first issues)
Below are concrete small tasks to help contributors get started. Each task includes a short description, suggested PR title, and an estimated difficulty level.

1) Add LICENSE (MIT)
   - Description: Add a LICENSE file (MIT) to clarify the repository license.
   - PR title: `chore: add MIT license`
   - Difficulty: easy

2) Add `.env.example`
   - Description: Create a minimal `.env.example` with keys used by docker-compose and the apps (DB URL, ports, credentials). This helps onboarding.
   - PR title: `chore: add .env.example`
   - Difficulty: easy

3) Create `CONTRIBUTING.md`
   - Description: Add a CONTRIBUTING guide with branching, commit message conventions, and how to run tests locally.
   - PR title: `docs: add CONTRIBUTING.md`
   - Difficulty: easy

4) Add README badges
   - Description: Add basic badges (build, license, repo size) to README header.
   - PR title: `docs: add README badges`
   - Difficulty: easy

5) Add ESLint + Prettier to frontend
   - Description: Add ESLint and Prettier configuration and a `lint` npm script in `frontend/package.json`.
   - PR title: `chore(frontend): add eslint and prettier`
   - Difficulty: small

6) Add a simple GitHub Actions CI for the frontend
   - Description: Run `npm ci` and `npm test` on push to main for the frontend.
   - PR title: `ci: add frontend CI workflow`
   - Difficulty: medium

7) Add unit tests for at least one backend API endpoint
   - Description: Add a focused unit/integration test for a single backend endpoint (use JUnit / preferred framework used by the project).
   - PR title: `test(backend): add tests for <endpoint>`
   - Difficulty: medium

8) Add sample seed data and a script
   - Description: Add a small SQL/JSON seed file and a script in `backend/` to load it into the development DB.
   - PR title: `chore: add sample seed data`
   - Difficulty: small

9) Add API docs (OpenAPI/Swagger)
   - Description: If not present, add an OpenAPI spec or enable Swagger UI in the backend for easier API exploration.
   - PR title: `docs(backend): add OpenAPI/Swagger spec`
   - Difficulty: medium

10) Frontend: mobile layout fix for navbar / map controls
    - Description: Improve responsiveness for narrow viewports (mobile) so map controls and navbar do not overlap.
    - PR title: `fix(frontend): improve mobile layout`
    - Difficulty: small

11) Improve backend error handling and validation
    - Description: Add input validation and consistent error responses for invalid requests. Add tests for error cases.
    - PR title: `fix(backend): add input validation and error handling`
    - Difficulty: medium

12) Performance: profile route calculation and add basic optimization
    - Description: Identify slow hotspots when calculating routes and make an incremental optimization (cache, algorithm tweak, or limit scope).
    - PR title: `perf: optimize route calculation`
    - Difficulty: hard

If you want any of these created as tracked GitHub issues, I can open them for you with suggested labels (good first issue, help wanted, difficulty:easy/medium/hard).

## How to pick a task
- Look for `easy` or `small` tasks if you are new to the project.
- Search the code for TODOs and `FIXME` comments to find high-impact quick fixes.
- Mention the task you plan to work on in a new issue or comment on an existing one to avoid duplication.

## Contributing guidelines
1. Fork the repo and create a branch named `feat/short-description` or `fix/short-description`.
2. Write tests for new behavior where applicable.
3. Keep changes small and focused per PR.
4. Use clear commit messages and a descriptive PR title (see suggested PR titles above).

## Useful docs
- OptiRoute guide: `OptiRoute_Guide.md`
- Database schema: `OptiRoute_Database_Schema.md`

## Author
- Repository: https://github.com/miheer2003/OptiRoute
