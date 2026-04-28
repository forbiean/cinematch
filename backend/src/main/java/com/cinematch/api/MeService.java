package com.cinematch.api;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class MeService {

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy年M月");

    private final JwtService jwtService;
    private final NamedParameterJdbcTemplate jdbcTemplate;

    public MeService(JwtService jwtService, NamedParameterJdbcTemplate jdbcTemplate) {
        this.jwtService = jwtService;
        this.jdbcTemplate = jdbcTemplate;
    }

    public MeProfileResponse profile(String authorization) {
        String token = extractToken(authorization);
        Map<String, Object> claims = jwtService.parseToken(token);
        if (claims == null || claims.get("userId") == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "invalid token");
        }
        Long userId = ((Number) claims.get("userId")).longValue();
        String email = String.valueOf(claims.getOrDefault("sub", ""));

        List<UserProfileRow> rows = jdbcTemplate.query("""
                SELECT id, email, created_at
                FROM users
                WHERE id = :id
                LIMIT 1
                """, new MapSqlParameterSource("id", userId), (rs, rowNum) -> new UserProfileRow(
                rs.getLong("id"),
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

        String nickname = deriveNickname(email.isBlank() ? user.email() : email);
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

record UserProfileRow(Long id, String email, LocalDateTime createdAt) {}

record StatsRow(int ratedCount, int favoriteCount, BigDecimal avgScore) {}

