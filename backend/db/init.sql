-- CineMatch DB Init Script (MySQL 8+)
-- Usage:
--   1) mysql -u root -p < backend/db/init.sql
--   2) Or run in your SQL client.

CREATE DATABASE IF NOT EXISTS cinematch
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE cinematch;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nickname VARCHAR(80),
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS movies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  summary TEXT,
  director VARCHAR(120),
  cast_text VARCHAR(500),
  release_year INT,
  poster_url VARCHAR(500),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS movie_tags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  movie_id BIGINT NOT NULL,
  tag VARCHAR(50) NOT NULL,
  CONSTRAINT fk_movie_tags_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  INDEX idx_movie_tags_movie_id (movie_id),
  INDEX idx_movie_tags_tag (tag)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ratings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  movie_id BIGINT NOT NULL,
  score INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT uq_ratings_user_movie UNIQUE (user_id, movie_id),
  INDEX idx_ratings_movie_id (movie_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS favorites (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  movie_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT uq_favorites_user_movie UNIQUE (user_id, movie_id),
  INDEX idx_favorites_movie_id (movie_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recommendation_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  strategy VARCHAR(50) NOT NULL,
  result_count INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recommendation_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_recommendation_logs_user_id (user_id),
  INDEX idx_recommendation_logs_created_at (created_at)
) ENGINE=InnoDB;

-- =========================================================
-- 管理员账号初始化（给新人）
-- =========================================================
-- 背景：
-- 1) 前台注册默认 role=USER，不能直接注册管理员。
-- 2) 管理员必须是 role='ADMIN' 才能访问 /admin 与 /api/admin/*。
--
-- 方案A（推荐）：先用前台注册一个普通账号，再执行“提权”SQL
-- 说明：不改密码，只把该账号角色改为 ADMIN。
-- UPDATE users
-- SET role = 'ADMIN'
-- WHERE email = 'your_user@example.com';
--
-- 方案B：直接插入管理员账号（可重复执行）
-- 说明：
-- - password_hash 必须是 BCrypt 哈希串（不是明文密码）。
-- - 下面示例的明文密码是：password
-- - 若你有自己的 BCrypt 哈希，请替换 password_hash。
-- - ON DUPLICATE KEY UPDATE 可保证重复执行脚本时不会报唯一键冲突。
-- INSERT INTO users(email, password_hash, role)
-- VALUES('admin@cinematch.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN')
-- ON DUPLICATE KEY UPDATE role = 'ADMIN';
--
-- 快速校验：
-- SELECT id, email, role FROM users WHERE role = 'ADMIN';
