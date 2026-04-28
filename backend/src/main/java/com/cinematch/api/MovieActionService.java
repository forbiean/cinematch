package com.cinematch.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class MovieActionService {

    private final JwtService jwtService;
    private final NamedParameterJdbcTemplate jdbcTemplate;

    public MovieActionService(JwtService jwtService, NamedParameterJdbcTemplate jdbcTemplate) {
        this.jwtService = jwtService;
        this.jdbcTemplate = jdbcTemplate;
    }

    public RatingSaveResponse rateMovie(Long movieId, RatingRequest request, String authorization) {
        if (request == null || request.score() < 1 || request.score() > 5) {
            throw new ResponseStatusException(BAD_REQUEST, "score must be between 1 and 5");
        }
        Long userId = extractUserId(authorization);
        ensureMovieExists(movieId);

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("userId", userId)
                .addValue("movieId", movieId)
                .addValue("score", request.score());
        jdbcTemplate.update("""
                INSERT INTO ratings(user_id, movie_id, score)
                VALUES(:userId, :movieId, :score)
                ON DUPLICATE KEY UPDATE score = VALUES(score), created_at = CURRENT_TIMESTAMP
                """, params);
        return new RatingSaveResponse(movieId, request.score(), true);
    }

    public FavoriteResponse favoriteMovie(Long movieId, String authorization) {
        Long userId = extractUserId(authorization);
        ensureMovieExists(movieId);
        jdbcTemplate.update("""
                INSERT INTO favorites(user_id, movie_id)
                VALUES(:userId, :movieId)
                ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
                """, new MapSqlParameterSource()
                .addValue("userId", userId)
                .addValue("movieId", movieId));
        return new FavoriteResponse(movieId, true, true);
    }

    public FavoriteResponse unfavoriteMovie(Long movieId, String authorization) {
        Long userId = extractUserId(authorization);
        ensureMovieExists(movieId);
        int affected = jdbcTemplate.update("""
                DELETE FROM favorites
                WHERE user_id = :userId AND movie_id = :movieId
                """, new MapSqlParameterSource()
                .addValue("userId", userId)
                .addValue("movieId", movieId));
        return new FavoriteResponse(movieId, false, affected > 0);
    }

    private void ensureMovieExists(Long movieId) {
        List<Long> ids = jdbcTemplate.queryForList("""
                SELECT id FROM movies WHERE id = :id LIMIT 1
                """, new MapSqlParameterSource("id", movieId), Long.class);
        if (ids.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "movie not found");
        }
    }

    private Long extractUserId(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(UNAUTHORIZED, "missing token");
        }
        String token = authorization.substring("Bearer ".length()).trim();
        Map<String, Object> claims = jwtService.parseToken(token);
        if (claims == null || claims.get("userId") == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "invalid token");
        }
        return ((Number) claims.get("userId")).longValue();
    }
}

record RatingRequest(
        @Min(value = 1, message = "score must be between 1 and 5")
        @Max(value = 5, message = "score must be between 1 and 5")
        int score
) {}

record RatingSaveResponse(Long movieId, int score, boolean saved) {}

record FavoriteResponse(Long movieId, boolean favorite, boolean saved) {}
