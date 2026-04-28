# CineMatch Monorepo

CineMatch 是一个电影推荐系统，前后端分离：
- 前端：React + Vite
- 后端：Spring Boot 3 + MySQL

## 角色与权限
- 游客：仅可浏览电影列表、电影详情。
- 注册用户：可登录、评分、收藏、查看推荐、维护个人资料（昵称/密码）。
- 管理员：拥有后台管理权限（`/admin`），可管理电影、标签，查看运营概览。

## 目录结构
- `frontend/`：前端项目
- `backend/`：后端项目
- `backend/db/init.sql`：数据库初始化脚本
- `backend/db/seed_phase1.sql`：测试种子数据脚本
- `docs/`：项目文档

## 环境要求
- Node.js 18+
- Java 17
- Maven 3.9+
- MySQL 8+

## 快速启动

### 1) 初始化数据库（首次）
```powershell
mysql -u root -p < E:\gitd\ccodes\jiedan\cinematch\backend\db\init.sql
```

### 2) 配置后端本地环境（首次）
```powershell
cd E:\gitd\ccodes\jiedan\cinematch\backend
copy src\main\resources\application-local.example.yml src\main\resources\application-local.yml
```
然后编辑 `backend/src/main/resources/application-local.yml`，填入本地 MySQL 密码。

### 3) 启动后端
```powershell
cd E:\gitd\ccodes\jiedan\cinematch\backend
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```

### 4) 启动前端（新终端）
```powershell
cd E:\gitd\ccodes\jiedan\cinematch\frontend
npm install
npm run dev
```

### 5) 访问地址
- 前端：`http://localhost:5173`
- 后端健康检查：`http://localhost:8080/api/health`

## 管理员账号初始化
由于前台注册默认是 `USER`，管理员需通过 SQL 设置。

可选方案：
1. 先前台注册普通账号，再提权：
```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'your_user@example.com';
```

2. 直接插入管理员（示例见 `backend/db/init.sql` 注释区）。

## 测试数据（可选）
执行测试种子脚本：
```powershell
mysql -u root -p < E:\gitd\ccodes\jiedan\cinematch\backend\db\seed_phase1.sql
```
说明：`seed_phase1.sql` 中测试用户前台登录明文密码为 `password`。

## 当前已实现核心功能
- 前台：
  - 登录/注册
  - 电影列表（搜索、筛选、排序、分页）
  - 电影详情（评分、收藏、分享）
  - 推荐页
  - 个人中心（评分/收藏、修改昵称与密码、退出登录）
- 后台（管理员）：
  - 数据概览（电影总数、注册用户、今日评分、收藏率）
  - 近 7 日评分趋势（周一到周日）
  - 热门标签
  - 推荐效果概览（真实推荐日志聚合）
  - 标签管理（新增/删除，删除前警告）
  - 电影管理（搜索、新增、编辑、删除；含导演/主演/多选标签）

## 常用构建命令
### 前端
```powershell
cd frontend
npm run build
```

### 后端
```powershell
cd backend
mvn -q -DskipTests package
```

## 开发说明
- 前端通过 Vite 代理 `/api` 到后端 `8080`。
- 后端包含对部分历史库结构的兼容补字段逻辑（如 `users.nickname`、`movies.director/cast_text`）。
- 若你更新了 SQL 脚本并重建数据库，建议先执行 `init.sql`，再执行可选的 `seed_phase1.sql`。
