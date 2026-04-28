# CineMatch Monorepo

## Frontend (React)
- Path: `frontend`
- Dev: `npm install && npm run dev`
- Build: `npm run build`

## Backend (Spring Boot 3)
- Path: `backend`
- Requires: Java 17, Maven 3.9+
- Run: `mvn spring-boot:run`
- Health: `GET http://localhost:8080/api/health`

## Dev Flow
1. Run backend on `8080`.
2. Run frontend on `5173` (Vite proxy `/api` to backend).
