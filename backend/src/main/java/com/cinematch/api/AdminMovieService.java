package com.cinematch.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AdminMovieService {

    private static final String DEFAULT_POSTER = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80";

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AdminMovieService(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public AdminMoviesPageResponse listMovies(int page, int pageSize) {
        int safePageSize = Math.min(Math.max(pageSize, 1), 50);
        int safePage = Math.max(page, 1);
        int offset = (safePage - 1) * safePageSize;

        Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM movies", new MapSqlParameterSource(), Long.class);
        List<AdminMovieItem> items = jdbcTemplate.query("""
                SELECT m.id, m.title, m.summary, m.release_year, m.poster_url, COALESCE(ROUND(AVG(r.score), 1), 0.0) AS rating
                FROM movies m
                LEFT JOIN ratings r ON r.movie_id = m.id
                GROUP BY m.id, m.title, m.summary, m.release_year, m.poster_url
                ORDER BY m.id DESC
                LIMIT :limit OFFSET :offset
                """, new MapSqlParameterSource()
                .addValue("limit", safePageSize)
                .addValue("offset", offset), (rs, rowNum) -> new AdminMovieItem(
                rs.getLong("id"),
                rs.getString("title"),
                rs.getString("title"),
                rs.getInt("release_year"),
                normalizePoster(rs.getString("poster_url")),
                rs.getString("summary") == null ? "" : rs.getString("summary"),
                rs.getBigDecimal("rating"),
                new ArrayList<>()
        ));

        fillTags(items);
        return new AdminMoviesPageResponse(items, total == null ? 0 : total, safePage, safePageSize);
    }

    public AdminMovieCreateResponse createMovie(AdminMovieCreateRequest request) {
        if (request == null || request.title() == null || request.title().trim().isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "title is required");
        }
        if (request.year() < 1888 || request.year() > 2100) {
            throw new ResponseStatusException(BAD_REQUEST, "year is invalid");
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update("""
                INSERT INTO movies(title, summary, release_year, poster_url)
                VALUES(:title, :summary, :year, :poster)
                """, new MapSqlParameterSource()
                .addValue("title", request.title().trim())
                .addValue("summary", request.summary() == null ? "" : request.summary().trim())
                .addValue("year", request.year())
                .addValue("poster", request.poster() == null ? "" : request.poster().trim()), keyHolder, new String[]{"id"});

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new ResponseStatusException(BAD_REQUEST, "create movie failed");
        }
        long movieId = key.longValue();

        List<String> tags = request.tags() == null ? List.of() : request.tags().stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .toList();
        for (String tag : tags) {
            jdbcTemplate.update("""
                    INSERT INTO movie_tags(movie_id, tag)
                    VALUES(:movieId, :tag)
                    """, new MapSqlParameterSource()
                    .addValue("movieId", movieId)
                    .addValue("tag", tag));
        }
        return new AdminMovieCreateResponse(movieId, true);
    }

    public AdminMovieUpdateResponse updateMovie(Long id, AdminMovieUpdateRequest request) {
        List<Long> exists = jdbcTemplate.queryForList(
                "SELECT id FROM movies WHERE id = :id LIMIT 1",
                new MapSqlParameterSource("id", id),
                Long.class
        );
        if (exists.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "movie not found");
        }
        if (request == null) {
            throw new ResponseStatusException(BAD_REQUEST, "request is required");
        }
        if (request.title() != null && request.title().trim().isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "title cannot be empty");
        }
        if (request.year() != null && (request.year() < 1888 || request.year() > 2100)) {
            throw new ResponseStatusException(BAD_REQUEST, "year is invalid");
        }

        String currentTitle = jdbcTemplate.queryForObject(
                "SELECT title FROM movies WHERE id = :id",
                new MapSqlParameterSource("id", id),
                String.class
        );
        Integer currentYear = jdbcTemplate.queryForObject(
                "SELECT release_year FROM movies WHERE id = :id",
                new MapSqlParameterSource("id", id),
                Integer.class
        );
        String currentPoster = jdbcTemplate.queryForObject(
                "SELECT poster_url FROM movies WHERE id = :id",
                new MapSqlParameterSource("id", id),
                String.class
        );
        String currentSummary = jdbcTemplate.queryForObject(
                "SELECT summary FROM movies WHERE id = :id",
                new MapSqlParameterSource("id", id),
                String.class
        );

        jdbcTemplate.update("""
                UPDATE movies
                SET title = :title,
                    release_year = :year,
                    poster_url = :poster,
                    summary = :summary
                WHERE id = :id
                """, new MapSqlParameterSource()
                .addValue("id", id)
                .addValue("title", request.title() == null ? currentTitle : request.title().trim())
                .addValue("year", request.year() == null ? currentYear : request.year())
                .addValue("poster", request.poster() == null ? currentPoster : request.poster().trim())
                .addValue("summary", request.summary() == null ? currentSummary : request.summary().trim()));

        if (request.tags() != null) {
            List<String> tags = request.tags().stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .toList();
            jdbcTemplate.update("DELETE FROM movie_tags WHERE movie_id = :movieId", new MapSqlParameterSource("movieId", id));
            for (String tag : tags) {
                jdbcTemplate.update("""
                        INSERT INTO movie_tags(movie_id, tag)
                        VALUES(:movieId, :tag)
                        """, new MapSqlParameterSource()
                        .addValue("movieId", id)
                        .addValue("tag", tag));
            }
        }

        return new AdminMovieUpdateResponse(id, true);
    }

    private void fillTags(List<AdminMovieItem> items) {
        if (items.isEmpty()) {
            return;
        }
        List<Long> ids = items.stream().map(AdminMovieItem::id).toList();
        Map<Long, AdminMovieItem> index = new LinkedHashMap<>();
        for (AdminMovieItem item : items) {
            index.put(item.id(), item);
        }
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT movie_id, tag
                FROM movie_tags
                WHERE movie_id IN (:ids)
                ORDER BY id ASC
                """, new MapSqlParameterSource("ids", ids));
        for (Map<String, Object> row : rows) {
            Long movieId = ((Number) row.get("movie_id")).longValue();
            String tag = (String) row.get("tag");
            AdminMovieItem item = index.get(movieId);
            if (item != null) {
                item.genres().add(tag);
            }
        }
    }

    private String normalizePoster(String posterUrl) {
        if (posterUrl == null || posterUrl.isBlank()) {
            return DEFAULT_POSTER;
        }
        return posterUrl;
    }
}

record AdminMoviesPageResponse(
        List<AdminMovieItem> items,
        long total,
        int page,
        int pageSize
) {}

record AdminMovieItem(
        long id,
        String title,
        String originalTitle,
        int year,
        String poster,
        String summary,
        BigDecimal rating,
        List<String> genres
) {}

record AdminMovieCreateRequest(
        @NotBlank(message = "title is required")
        @Size(max = 200, message = "title is too long")
        String title,
        @Min(value = 1888, message = "year is invalid")
        @Max(value = 2100, message = "year is invalid")
        int year,
        String poster,
        String summary,
        List<String> tags
) {}

record AdminMovieCreateResponse(
        long id,
        boolean created
) {}

record AdminMovieUpdateRequest(
        @Size(max = 200, message = "title is too long")
        String title,
        @Min(value = 1888, message = "year is invalid")
        @Max(value = 2100, message = "year is invalid")
        Integer year,
        String poster,
        String summary,
        List<String> tags
) {}

record AdminMovieUpdateResponse(
        long id,
        boolean updated
) {}
