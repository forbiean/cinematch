package com.cinematch.api;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class MeService {

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy年M月");

    private final JwtService jwtService;
    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public MeService(JwtService jwtService, NamedParameterJdbcTemplate jdbcTemplate) {
        this.jwtService = jwtService;
        this.jdbcTemplate = jdbcTemplate;
    }

    public MeProfileResponse profile(String authorization) {
        ensureNicknameColumn();
        Map<String, Object> claims = parseClaims(authorization);
        Long userId = ((Number) claims.get("userId")).longValue();
        String email = String.valueOf(claims.getOrDefault("sub", ""));

        List<UserProfileRow> rows = jdbcTemplate.query("""
                SELECT id, nickname, email, created_at
                FROM users
                WHERE id = :id
                LIMIT 1
                """, new MapSqlParameterSource("id", userId), (rs, rowNum) -> new UserProfileRow(
                rs.getLong("id"),
                rs.getString("nickname"),
                rs.getString("email"),
                rs.getTimestamp("created_at").toLocalDateTime()
        ));
        if (rows.isEmpty()) {
            throw new ResponseStatusException(UNAUTHORIZED, "user not found");
        }

        UserProfileRow user = rows.get(0);
        StatsRow stats = jdbcTemplate.queryForObject("""
                SELECT
                  (SELECT COUNT(*) FROM ratings WHERE user_id = :id) AS rated_count,
                  (SELECT COUNT(*) FROM favorites WHERE user_id = :id) AS favorite_count,
                  (SELECT COALESCE(ROUND(AVG(score), 1), 0.0) FROM ratings WHERE user_id = :id) AS avg_score
                """, new MapSqlParameterSource("id", userId), (rs, rowNum) -> new StatsRow(
                rs.getInt("rated_count"),
                rs.getInt("favorite_count"),
                rs.getBigDecimal("avg_score")
        ));

        String favoriteGenre = jdbcTemplate.query("""
                SELECT mt.tag
                FROM ratings r
                JOIN movie_tags mt ON mt.movie_id = r.movie_id
                WHERE r.user_id = :id
                GROUP BY mt.tag
                ORDER BY COUNT(*) DESC, mt.tag ASC
                LIMIT 1
                """, new MapSqlParameterSource("id", userId), rs -> rs.next() ? rs.getString("tag") : "暂无");

        String nickname = user.nickname() == null || user.nickname().isBlank()
                ? deriveNickname(email.isBlank() ? user.email() : email)
                : user.nickname().trim();
        String joinAt = user.createdAt().format(MONTH_FMT);
        return new MeProfileResponse(
                user.id(),
                nickname,
                user.email(),
                joinAt,
                stats == null ? 0 : stats.ratedCount(),
                stats == null ? 0 : stats.favoriteCount(),
                stats == null ? BigDecimal.ZERO : stats.avgScore(),
                favoriteGenre == null || favoriteGenre.isBlank() ? "暂无" : favoriteGenre
        );
    }

    public List<MyRatingItem> myRatings(String authorization) {
        Long userId = extractUserId(authorization);
        return jdbcTemplate.query("""
                SELECT r.movie_id, m.title, m.release_year, m.poster_url, r.score, r.created_at
                FROM ratings r
                JOIN movies m ON m.id = r.movie_id
                WHERE r.user_id = :userId
                ORDER BY r.created_at DESC, r.id DESC
                """, new MapSqlParameterSource("userId", userId), (rs, rowNum) -> new MyRatingItem(
                rs.getLong("movie_id"),
                rs.getString("title"),
                rs.getInt("release_year"),
                normalizePoster(rs.getString("poster_url")),
                rs.getInt("score"),
                rs.getTimestamp("created_at").toLocalDateTime().toLocalDate().toString()
        ));
    }

    public List<MovieListItem> myFavorites(String authorization) {
        Long userId = extractUserId(authorization);
        List<MovieListItem> items = jdbcTemplate.query("""
                SELECT m.id, m.title, m.release_year, m.poster_url, COALESCE(ROUND(AVG(r.score), 1), 0.0) AS rating
                FROM favorites f
                JOIN movies m ON m.id = f.movie_id
                LEFT JOIN ratings r ON r.movie_id = m.id
                WHERE f.user_id = :userId
                GROUP BY m.id, m.title, m.release_year, m.poster_url, f.created_at
                ORDER BY f.created_at DESC, m.id DESC
                """, new MapSqlParameterSource("userId", userId), (rs, rowNum) -> new MovieListItem(
                rs.getLong("id"),
                rs.getString("title"),
                rs.getInt("release_year"),
                normalizePoster(rs.getString("poster_url")),
                rs.getBigDecimal("rating"),
                new ArrayList<>()
        ));
        fillTags(items);
        return items;
    }

    public MeProfileUpdateResponse updateProfile(String authorization, MeProfileUpdateRequest request) {
        ensureNicknameColumn();
        Long userId = extractUserId(authorization);
        if (request == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "request is required");
        }
        String nickname = request.nickname() == null ? "" : request.nickname().trim();
        String password = request.password() == null ? "" : request.password();
        if (nickname.isEmpty() && password.isEmpty()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "no fields to update");
        }
        if (!password.isEmpty() && password.length() < 8) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "password length must be at least 8");
        }

        String currentNickname = jdbcTemplate.queryForObject(
                "SELECT nickname FROM users WHERE id = :id",
                new MapSqlParameterSource("id", userId),
                String.class
        );
        String nextNickname = nickname.isEmpty() ? (currentNickname == null ? "" : currentNickname) : nickname;

        if (password.isEmpty()) {
            jdbcTemplate.update("""
                    UPDATE users
                    SET nickname = :nickname
                    WHERE id = :id
                    """, new MapSqlParameterSource()
                    .addValue("id", userId)
                    .addValue("nickname", nextNickname));
        } else {
            jdbcTemplate.update("""
                    UPDATE users
                    SET nickname = :nickname,
                        password_hash = :passwordHash
                    WHERE id = :id
                    """, new MapSqlParameterSource()
                    .addValue("id", userId)
                    .addValue("nickname", nextNickname)
                    .addValue("passwordHash", passwordEncoder.encode(password)));
        }
        return new MeProfileUpdateResponse(true, "资料已更新");
    }

    private Long extractUserId(String authorization) {
        Map<String, Object> claims = parseClaims(authorization);
        return ((Number) claims.get("userId")).longValue();
    }

    private Map<String, Object> parseClaims(String authorization) {
        String token = extractToken(authorization);
        Map<String, Object> claims = jwtService.parseToken(token);
        if (claims == null || claims.get("userId") == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "invalid token");
        }
        return claims;
    }

    private String extractToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(UNAUTHORIZED, "missing token");
        }
        return authorization.substring("Bearer ".length()).trim();
    }

    private String deriveNickname(String email) {
        int at = email.indexOf("@");
        String name = at > 0 ? email.substring(0, at) : email;
        if (name.isBlank()) {
            return "用户";
        }
        return name;
    }

    private void ensureNicknameColumn() {
        Long count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = 'users'
                  AND column_name = 'nickname'
                """, new MapSqlParameterSource(), Long.class);
        if (count == null || count == 0) {
            jdbcTemplate.getJdbcTemplate().execute("""
                    ALTER TABLE users
                    ADD COLUMN nickname VARCHAR(80) NULL
                    """);
        }
    }

    private String normalizePoster(String posterUrl) {
        if (posterUrl == null || posterUrl.isBlank()) {
            return "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80";
        }
        return posterUrl;
    }

    private void fillTags(List<MovieListItem> items) {
        if (items.isEmpty()) {
            return;
        }
        List<Long> ids = items.stream().map(MovieListItem::id).toList();
        Map<Long, MovieListItem> index = items.stream()
                .collect(Collectors.toMap(MovieListItem::id, item -> item, (a, b) -> a, LinkedHashMap::new));
        List<Map<String, Object>> tags = jdbcTemplate.queryForList("""
                SELECT movie_id, tag
                FROM movie_tags
                WHERE movie_id IN (:ids)
                ORDER BY id ASC
                """, new MapSqlParameterSource("ids", ids));

        for (Map<String, Object> row : tags) {
            Long movieId = ((Number) row.get("movie_id")).longValue();
            String tag = (String) row.get("tag");
            MovieListItem item = index.get(movieId);
            if (item != null) {
                item.genres().add(tag);
            }
        }
    }
}

record MeProfileResponse(
        Long id,
        String nickname,
        String email,
        String joinAt,
        int ratedCount,
        int favoriteCount,
        BigDecimal avgScore,
        String favoriteGenre
) {}

record UserProfileRow(Long id, String nickname, String email, LocalDateTime createdAt) {}

record StatsRow(int ratedCount, int favoriteCount, BigDecimal avgScore) {}

record MyRatingItem(
        Long movieId,
        String title,
        int year,
        String poster,
        int score,
        String date
) {}

record MeProfileUpdateRequest(
        String nickname,
        String password
) {}

record MeProfileUpdateResponse(
        boolean updated,
        String message
) {}
