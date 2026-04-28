package com.cinematch.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class AdminTagService {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AdminTagService(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AdminTagItem> listTags() {
        ensureLibraryTable();
        return jdbcTemplate.query("""
                SELECT t.name, COALESCE(m.cnt, 0) AS usage_count
                FROM (
                    SELECT name FROM tag_library
                    UNION
                    SELECT DISTINCT tag AS name FROM movie_tags
                ) t
                LEFT JOIN (
                    SELECT tag, COUNT(*) AS cnt
                    FROM movie_tags
                    GROUP BY tag
                ) m ON m.tag = t.name
                ORDER BY usage_count DESC, t.name ASC
                """, new MapSqlParameterSource(), (rs, rowNum) -> new AdminTagItem(
                rs.getString("name"),
                rs.getLong("usage_count")
        ));
    }

    public AdminTagCreateResponse createTag(AdminTagCreateRequest request) {
        ensureLibraryTable();
        if (request == null || request.name() == null || request.name().trim().isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "tag name is required");
        }
        String name = request.name().trim();
        jdbcTemplate.update("""
                INSERT IGNORE INTO tag_library(name)
                VALUES(:name)
                """, new MapSqlParameterSource("name", name));
        return new AdminTagCreateResponse(name, true);
    }

    public AdminTagDeleteResponse deleteTag(String name) {
        ensureLibraryTable();
        if (name == null || name.trim().isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "tag name is required");
        }
        String safeName = name.trim();
        int detached = jdbcTemplate.update("""
                DELETE FROM movie_tags
                WHERE tag = :name
                """, new MapSqlParameterSource("name", safeName));
        jdbcTemplate.update("""
                DELETE FROM tag_library
                WHERE name = :name
                """, new MapSqlParameterSource("name", safeName));
        return new AdminTagDeleteResponse(safeName, detached, true);
    }

    private void ensureLibraryTable() {
        jdbcTemplate.getJdbcTemplate().execute("""
                CREATE TABLE IF NOT EXISTS tag_library (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  name VARCHAR(50) NOT NULL UNIQUE,
                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB
                """);
    }
}

record AdminTagItem(
        String name,
        long usageCount
) {}

record AdminTagCreateRequest(
        @NotBlank(message = "name is required")
        @Size(max = 50, message = "name is too long")
        String name
) {}

record AdminTagCreateResponse(
        String name,
        boolean created
) {}

record AdminTagDeleteResponse(
        String name,
        int detachedMovieTagRows,
        boolean deleted
) {}

