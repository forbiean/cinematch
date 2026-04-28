package com.cinematch.api;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class MovieQueryService {

    private static final String DEFAULT_POSTER = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80";
    private final NamedParameterJdbcTemplate jdbcTemplate;

    public MovieQueryService(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public MoviesPageResponse listMovies(int page, int pageSize, String query, String genre, String sort) {
        int safePageSize = Math.min(Math.max(pageSize, 1), 50);
        int safePage = Math.max(page, 1);
        int offset = (safePage - 1) * safePageSize;
        String orderBy = resolveOrderBy(sort);

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("query", toLikeQuery(query))
                .addValue("hasQuery", hasText(query))
                .addValue("genre", genre)
                .addValue("allGenre", "all")
                .addValue("limit", safePageSize)
                .addValue("offset", offset);

        Long total = jdbcTemplate.queryForObject("""
                SELECT COUNT(DISTINCT m.id)
                FROM movies m
                LEFT JOIN movie_tags mt ON mt.movie_id = m.id
                WHERE (:hasQuery = false OR m.title LIKE :query OR m.summary LIKE :query)
                  AND (:genre = :allGenre OR mt.tag = :genre)
                """, params, Long.class);

        List<MovieListItem> items = jdbcTemplate.query("""
                SELECT m.id, m.title, m.release_year, m.poster_url, COALESCE(ROUND(AVG(r.score), 1), 0.0) AS rating
                FROM movies m
                LEFT JOIN ratings r ON r.movie_id = m.id
                LEFT JOIN movie_tags mt ON mt.movie_id = m.id
                WHERE (:hasQuery = false OR m.title LIKE :query OR m.summary LIKE :query)
                  AND (:genre = :allGenre OR mt.tag = :genre)
                GROUP BY m.id, m.title, m.release_year, m.poster_url
                ORDER BY %s
                LIMIT :limit OFFSET :offset
                """.formatted(orderBy), params, (rs, rowNum) -> new MovieListItem(
                rs.getLong("id"),
                rs.getString("title"),
                rs.getInt("release_year"),
                normalizePoster(rs.getString("poster_url")),
                rs.getBigDecimal("rating"),
                new ArrayList<>()
        ));

        fillTags(items);

        return new MoviesPageResponse(
                items,
                total == null ? 0 : total,
                safePage,
                safePageSize
        );
    }

    public MovieDetailResponse getMovieDetail(Long id) {
        MapSqlParameterSource params = new MapSqlParameterSource("id", id);
        List<MovieDetailResponse> details = jdbcTemplate.query("""
                SELECT m.id, m.title, m.summary, m.release_year, m.poster_url, COALESCE(ROUND(AVG(r.score), 1), 0.0) AS rating
                FROM movies m
                LEFT JOIN ratings r ON r.movie_id = m.id
                WHERE m.id = :id
                GROUP BY m.id, m.title, m.summary, m.release_year, m.poster_url
                """, params, (rs, rowNum) -> new MovieDetailResponse(
                rs.getLong("id"),
                rs.getString("title"),
                rs.getString("title"),
                rs.getInt("release_year"),
                normalizePoster(rs.getString("poster_url")),
                rs.getBigDecimal("rating"),
                new ArrayList<>(),
                new ArrayList<>(),
                rs.getString("summary") == null ? "" : rs.getString("summary"),
                "待补充",
                List.of("待补充"),
                false,
                0,
                new ArrayList<>()
        ));

        if (details.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "movie not found");
        }

        MovieDetailResponse detail = details.get(0);
        List<String> tags = jdbcTemplate.queryForList("""
                SELECT tag
                FROM movie_tags
                WHERE movie_id = :id
                ORDER BY id ASC
                """, params, String.class);
        detail.genres().addAll(tags);
        detail.tags().addAll(tags);
        detail.similar().addAll(querySimilarMovies(id, tags));
        return detail;
    }

    private List<MovieListItem> querySimilarMovies(Long movieId, List<String> tags) {
        if (tags.isEmpty()) {
            return List.of();
        }

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("movieId", movieId)
                .addValue("tags", tags)
                .addValue("limit", 4);

        List<MovieListItem> items = jdbcTemplate.query("""
                SELECT m.id, m.title, m.release_year, m.poster_url, COALESCE(ROUND(AVG(r.score), 1), 0.0) AS rating
                FROM movies m
                JOIN movie_tags mt ON mt.movie_id = m.id
                LEFT JOIN ratings r ON r.movie_id = m.id
                WHERE m.id <> :movieId
                  AND mt.tag IN (:tags)
                GROUP BY m.id, m.title, m.release_year, m.poster_url
                ORDER BY COUNT(mt.tag) DESC, rating DESC, m.id DESC
                LIMIT :limit
                """, params, (rs, rowNum) -> new MovieListItem(
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

        Map<Long, List<String>> tagsByMovie = new HashMap<>();
        for (Map<String, Object> row : tags) {
            Long movieId = ((Number) row.get("movie_id")).longValue();
            String tag = (String) row.get("tag");
            tagsByMovie.computeIfAbsent(movieId, key -> new ArrayList<>()).add(tag);
        }

        for (Map.Entry<Long, List<String>> entry : tagsByMovie.entrySet()) {
            MovieListItem item = index.get(entry.getKey());
            if (item != null) {
                item.genres().addAll(entry.getValue());
            }
        }
    }

    private String toLikeQuery(String query) {
        return "%" + (query == null ? "" : query.trim()) + "%";
    }

    private boolean hasText(String query) {
        return query != null && !query.trim().isEmpty();
    }

    private String resolveOrderBy(String sort) {
        if ("year".equalsIgnoreCase(sort)) {
            return "m.release_year DESC, m.id DESC";
        }
        if ("title".equalsIgnoreCase(sort)) {
            return "m.title ASC, m.id DESC";
        }
        return "rating DESC, m.id DESC";
    }

    private String normalizePoster(String posterUrl) {
        if (posterUrl == null || posterUrl.isBlank()) {
            return DEFAULT_POSTER;
        }
        return posterUrl;
    }
}

record MoviesPageResponse(
        List<MovieListItem> items,
        long total,
        int page,
        int pageSize
) {}

record MovieListItem(
        long id,
        String title,
        int year,
        String poster,
        BigDecimal rating,
        List<String> genres
) {}

record MovieDetailResponse(
        long id,
        String title,
        String originalTitle,
        int year,
        String poster,
        BigDecimal rating,
        List<String> genres,
        List<String> tags,
        String summary,
        String director,
        List<String> cast,
        boolean isFavorite,
        int userRating,
        List<MovieListItem> similar
) {}
