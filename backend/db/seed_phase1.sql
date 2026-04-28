USE cinematch;

-- Phase 1 test seed for CineMatch
-- Covers: movies list/detail/hot ranking

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE recommendation_logs;
TRUNCATE TABLE favorites;
TRUNCATE TABLE ratings;
TRUNCATE TABLE movie_tags;
TRUNCATE TABLE movies;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users(email, password_hash, role) VALUES
-- 以上测试账号的前台登录明文密码统一为：password
('alice@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'),
('bob@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'),
('carol@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'),
('dave@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER');

INSERT INTO movies(title, summary, release_year, poster_url) VALUES
('星际穿越', '一支探险队通过虫洞寻找人类新家园。', 2014, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop'),
('盗梦空间', '梦境潜入与意识迷宫中的高风险任务。', 2010, 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop'),
('肖申克的救赎', '在高墙内坚持希望与自由的故事。', 1994, 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=400&h=600&fit=crop'),
('寄生虫', '两个家庭之间的阶级冲突与反转。', 2019, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop'),
('阿甘正传', '平凡人生见证时代变迁。', 1994, 'https://images.unsplash.com/photo-1594909122849-11daa2a0cf2b?w=400&h=600&fit=crop'),
('楚门的世界', '一个人发现自己活在大型真人秀中。', 1998, 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop'),
('无间道', '警匪双方互派卧底的心理博弈。', 2002, 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop'),
('千与千寻', '少女在神灵世界中的成长冒险。', 2001, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop'),
('黑暗骑士', '哥谭守护者对抗混乱与恐惧。', 2008, 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop'),
('疯狂动物城', '动物都市里的搭档侦探故事。', 2016, 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&h=600&fit=crop');

INSERT INTO movie_tags(movie_id, tag) VALUES
(1, '科幻'), (1, '剧情'), (1, '冒险'),
(2, '科幻'), (2, '动作'), (2, '悬疑'),
(3, '剧情'), (3, '犯罪'),
(4, '剧情'), (4, '悬疑'), (4, '喜剧'),
(5, '剧情'), (5, '爱情'),
(6, '剧情'), (6, '科幻'),
(7, '犯罪'), (7, '剧情'), (7, '悬疑'),
(8, '动画'), (8, '奇幻'), (8, '冒险'),
(9, '动作'), (9, '犯罪'), (9, '剧情'),
(10, '动画'), (10, '冒险'), (10, '喜剧');

-- ratings crafted to test sort=rating and sort=hot
-- hot rule in current backend: rating count DESC, then avg score DESC
INSERT INTO ratings(user_id, movie_id, score) VALUES
(1, 1, 5), (2, 1, 5), (3, 1, 4), (4, 1, 5),
(1, 2, 5), (2, 2, 4), (3, 2, 5),
(1, 3, 5), (2, 3, 5),
(1, 4, 4), (2, 4, 5), (3, 4, 4), (4, 4, 4),
(1, 5, 5), (3, 5, 4),
(2, 6, 5), (4, 6, 4),
(1, 7, 4), (2, 7, 4), (3, 7, 5),
(2, 8, 5), (3, 8, 5),
(1, 9, 5), (4, 9, 5),
(3, 10, 4), (4, 10, 4);

INSERT INTO favorites(user_id, movie_id) VALUES
(1, 1), (1, 3), (1, 8),
(2, 1), (2, 2),
(3, 4), (3, 9),
(4, 6), (4, 10);

-- quick checks
-- SELECT COUNT(*) AS movies_cnt FROM movies;
-- SELECT movie_id, ROUND(AVG(score),1) avg_score, COUNT(*) score_cnt FROM ratings GROUP BY movie_id ORDER BY score_cnt DESC, avg_score DESC;
