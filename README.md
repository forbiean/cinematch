# CineMatch Monorepo

## Frontend (React)
- Path: `frontend`
- Dev: `npm install && npm run dev`
- Build: `npm run build`

## Backend (Spring Boot 3)
- Path: `backend`
- Requires: Java 17, Maven 3.9+
- Run: `mvn spring-boot:run "-Dspring-boot.run.profiles=local"`
- Health: `GET http://localhost:8080/api/health`
- More details: `backend/README.md`

## Quick Start

1. Initialize database (first time only)
```powershell
mysql -u root -p < E:\gitd\ccodes\jiedan\cinematch\backend\db\init.sql
```

2. Prepare backend local config (first time only)
```powershell
cd E:\gitd\ccodes\jiedan\cinematch\backend
copy src\main\resources\application-local.example.yml src\main\resources\application-local.yml
```
Edit `application-local.yml` and fill your real MySQL password.

3. Start backend
```powershell
cd E:\gitd\ccodes\jiedan\cinematch\backend
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```

4. Start frontend (open another terminal)
```powershell
cd E:\gitd\ccodes\jiedan\cinematch\frontend
npm install
npm run dev
```

5. Access
- Frontend: `http://localhost:5173`
- Backend Health: `http://localhost:8080/api/health`

## Dev Flow
1. Run backend on `8080`.
2. Run frontend on `5173` (Vite proxy `/api` to backend).
