# CineMatch Backend

基于 **Java 17 + Spring Boot 3 + Maven + MySQL 8** 的后端服务。

## 1. 环境要求

- JDK: `17`
- Maven: `3.9+`
- MySQL: `8.x`

验证命令：

```bash
java -version
mvn -v
```

## 2. 初始化数据库

项目已提供初始化脚本：

- `db/init.sql`

执行方式（Windows PowerShell）：

```powershell
mysql -u root -p < E:\gitd\ccodes\jiedan\cinematch\backend\db\init.sql
```

执行后会自动创建数据库 `cinematch` 及基础表结构。

## 3. 本地配置（避免提交敏感信息）

默认配置文件：

- `src/main/resources/application.yml`（无敏感信息，使用环境变量占位）

本地私有配置模板：

- `src/main/resources/application-local.example.yml`

### 操作步骤

1. 复制模板文件为本地文件：

```powershell
copy src\main\resources\application-local.example.yml src\main\resources\application-local.yml
```

2. 编辑 `application-local.yml`，填写你本机的 MySQL 用户名和密码。

`application-local.yml` 已在根目录 `.gitignore` 中忽略，不会提交到 Git。

## 4. 启动项目

在 `backend` 目录执行：

```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```

启动成功后默认端口：

- `http://localhost:8080`

## 5. 接口验证

健康检查接口：

```powershell
curl http://localhost:8080/api/health
```

预期响应：

```json
{"status":"ok"}
```

## 6. 常见问题

### 6.1 `mvn` 命令找不到

确认 Maven 已安装并配置环境变量 `Path`，重开终端后再试。

### 6.2 Maven 依赖下载失败（连接仓库失败）

先检查 DNS 与网络代理配置：

```powershell
nslookup repo.maven.apache.org
Test-NetConnection repo.maven.apache.org -Port 443
```

如果 `settings.xml` 配了无效代理或镜像，请修正 `%USERPROFILE%\.m2\settings.xml`。

### 6.3 数据库连接失败

检查：

- MySQL 服务是否启动
- `application-local.yml` 账号密码是否正确
- `cinematch` 数据库是否已创建（可重新执行 `db/init.sql`）

## 7. 打包命令

```powershell
mvn clean package -DskipTests
```

产物默认输出到：

- `target/`
