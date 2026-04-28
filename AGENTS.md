# Repository Guidelines

## Project Structure & Module Organization
- `frontend/`: React + Vite UI app. Main code in `frontend/src/` (`pages/`, `components/`, `data/`, `styles/`).
- `backend/`: Spring Boot 3 service. Java sources in `backend/src/main/java/com/cinematch/`, config in `backend/src/main/resources/`.
- `backend/db/init.sql`: MySQL bootstrap script.
- `docs/`: planning and product-facing documentation.
- Root `README.md`: quick full-stack startup flow.

## Build, Test, and Development Commands
- Frontend dev server:
  - `cd frontend && npm install && npm run dev`
  - Starts Vite on `http://localhost:5173`.
- Frontend production build:
  - `cd frontend && npm run build`
- Backend run (local profile):
  - `cd backend && mvn spring-boot:run "-Dspring-boot.run.profiles=local"`
- Backend package:
  - `cd backend && mvn clean package -DskipTests`
- Database init:
  - `mysql -u root -p < backend/db/init.sql`

## Coding Style & Naming Conventions
- Frontend: ES modules, functional React components, `PascalCase` for components (`MovieDetailPage.jsx`), `camelCase` for variables/functions.
- Backend: Java 17 conventions, `PascalCase` classes, `camelCase` methods/fields, package under `com.cinematch`.
- Use 2 spaces for YAML, 2 spaces for JS/JSX indentation, 4 spaces for Java.
- Keep API paths RESTful and consistent with PRD (e.g., `/api/movies/{id}`).

## Testing Guidelines
- Backend: JUnit via `spring-boot-starter-test`.
  - Run: `cd backend && mvn test`.
  - Test class naming: `*Test.java` (e.g., `MoviesControllerTest`).
- Frontend: no formal test suite yet; at minimum verify key flows manually:
  - login/register, movies list/detail, rating/favorite, recommendations, admin movies.

## Commit & Pull Request Guidelines
- Use clear, scoped commit messages (recommended):
  - `feat(movies): add paginated list API`
  - `fix(frontend): correct recommendation card layout`
- PRs should include:
  - Summary of changes and impacted modules (`frontend`/`backend`).
  - How to run and verify locally.
  - Screenshots/GIFs for UI changes.
  - Linked issue/task reference when available.

## Security & Configuration Tips
- Do not commit secrets.
- Keep real DB credentials only in `backend/src/main/resources/application-local.yml` (gitignored).
- Use `application-local.example.yml` as the onboarding template.
