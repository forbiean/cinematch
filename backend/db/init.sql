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

-- Optional seed admin account placeholder (replace password_hash with real hash):
-- INSERT INTO users(email, password_hash, role) VALUES('admin@cinematch.local', '<bcrypt-hash>', 'ADMIN');
