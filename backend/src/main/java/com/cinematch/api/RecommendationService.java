package com.cinematch.api;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class RecommendationService {

    private static final String DEFAULT_POSTER = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80";

    private final JwtService jwtService;
    private final NamedParameterJdbcTemplate jdbcTemplate;

    public RecommendationService(JwtService jwtService, NamedParameterJdbcTemplate jdbcTemplate) {
        this.jwtService = jwtService;
        this.jdbcTemplate = jdbcTemplate;
    }

    public RecommendationsResponse recommendations(String authorization) {
        Long userId = extractUserId(authorization);
        Map<String, Integer> preferredTags = loadPreferredTags(userId);
        List<RecommendationCandidate> candidates = loadCandidates(userId);
        fillTags(candidates);

        if (candidates.isEmpty()) {
            return new RecommendationsResponse(List.of(), "标签偏好 + 热门加权");
        }

        if (preferredTags.isEmpty()) {
            List<RecommendationItem> coldStart = candidates.stream()
                    .sorted(Comparator
                            .comparing(RecommendationCandidate::ratingCount).reversed()
                            .thenComparing(RecommendationCandidate::rating, Comparator.reverseOrder())
                            .thenComparing(RecommendationCandidate::id, Comparator.reverseOrder()))
                    .limit(10)
                    .map(c -> toItem(c, BigDecimal.valueOf(0.60), "冷启动：热门高分影片"))
                    .toList();
            return new RecommendationsResponse(coldStart, "冷启动热门");
        }

        int maxTagScore = 1;
        for (RecommendationCandidate candidate : candidates) {
            int tagScore = 0;
            for (String tag : candidate.tags()) {
                tagScore += preferredTags.getOrDefault(tag, 0);
            }
            candidate.tagScore(tagScore);
            if (tagScore > maxTagScore) {
                maxTagScore = tagScore;
            }
        }

        final int maxTagScoreFinal = maxTagScore;
        List<RecommendationItem> items = candidates.stream()
                .sorted((a, b) -> {
                    BigDecimal sb = scoreFor(b, maxTagScoreFinal);
                    BigDecimal sa = scoreFor(a, maxTagScoreFinal);
                    int cmp = sb.compareTo(sa);
                    if (cmp != 0) return cmp;
                    cmp = Integer.compare(b.ratingCount(), a.ratingCount());
                    if (cmp != 0) return cmp;
                    return Long.compare(b.id(), a.id());
                })
                .limit(10)
                .map(c -> toItem(c, scoreFor(c, maxTagScoreFinal), reasonFor(c, preferredTags)))
                .toList();

        return new RecommendationsResponse(items, "标签偏好 + 热门加权");
    }

    private RecommendationItem toItem(RecommendationCandidate c, BigDecimal score, String reason) {
        return new RecommendationItem(
                c.id(),
                c.title(),
                c.year(),
                normalizePoster(c.poster()),
                c.rating(),
                c.summary(),
                c.tags(),
                score,
                reason
        );
    }

    private BigDecimal scoreFor(RecommendationCandidate candidate, int maxTagScore) {
        BigDecimal tagPart = BigDecimal.valueOf(candidate.tagScore())
                .divide(BigDecimal.valueOf(maxTagScore), 4, RoundingMode.HALF_UP);
        BigDecimal ratingPart = candidate.rating() == null
                ? BigDecimal.ZERO
                : candidate.rating().divide(BigDecimal.TEN, 4, RoundingMode.HALF_UP);
        BigDecimal countPart = BigDecimal.valueOf(candidate.ratingCount())
                .divide(BigDecimal.valueOf(candidate.ratingCount() + 5), 4, RoundingMode.HALF_UP);
        BigDecimal hotPart = ratingPart.multiply(BigDecimal.valueOf(0.7)).add(countPart.multiply(BigDecimal.valueOf(0.3)));
        return tagPart.multiply(BigDecimal.valueOf(0.75))
                .add(hotPart.multiply(BigDecimal.valueOf(0.25)))
                .setScale(4, RoundingMode.HALF_UP);
    }

    private String reasonFor(RecommendationCandidate candidate, Map<String, Integer> preferredTags) {
        String bestTag = "";
        int bestWeight = -1;
        for (String tag : candidate.tags()) {
            int w = preferredTags.getOrDefault(tag, 0);
            if (w > bestWeight) {
                bestWeight = w;
                bestTag = tag;
            }
        }
        if (!bestTag.isBlank() && bestWeight > 0) {
            return "你近期偏好「" + bestTag + "」标签影片";
        }
        return "热门高分影片，与你近期口味接近";
    }

    private Map<String, Integer> loadPreferredTags(Long userId) {
        Map<String, Integer> tagWeights = new LinkedHashMap<>();

        List<Map<String, Object>> fromRatings = jdbcTemplate.queryForList("""
                SELECT mt.tag, COUNT(*) AS c
                FROM ratings r
                JOIN movie_tags mt ON mt.movie_id = r.movie_id
                WHERE r.user_id = :userId AND r.score >= 4
                GROUP BY mt.tag
                """, new MapSqlParameterSource("userId", userId));
        for (Map<String, Object> row : fromRatings) {
            String tag = (String) row.get("tag");
            int weight = ((Number) row.get("c")).intValue() * 2;
            tagWeights.put(tag, tagWeights.getOrDefault(tag, 0) + weight);
        }

        List<Map<String, Object>> fromFavorites = jdbcTemplate.queryForList("""
                SELECT mt.tag, COUNT(*) AS c
                FROM favorites f
                JOIN movie_tags mt ON mt.movie_id = f.movie_id
                WHERE f.user_id = :userId
                GROUP BY mt.tag
                """, new MapSqlParameterSource("userId", userId));
        for (Map<String, Object> row : fromFavorites) {
            String tag = (String) row.get("tag");
            int weight = ((Number) row.get("c")).intValue();
            tagWeights.put(tag, tagWeights.getOrDefault(tag, 0) + weight);
        }
        return tagWeights;
    }

    private List<RecommendationCandidate> loadCandidates(Long userId) {
        return jdbcTemplate.query("""
                SELECT m.id, m.title, m.release_year, m.poster_url, m.summary,
                       COALESCE(ROUND(AVG(r.score), 1), 0.0) AS rating,
                       COUNT(r.id) AS rating_count
                FROM movies m
                LEFT JOIN ratings r ON r.movie_id = m.id
                WHERE m.id NOT IN (
                    SELECT movie_id FROM ratings WHERE user_id = :userId
                    UNION
                    SELECT movie_id FROM favorites WHERE user_id = :userId
                )
                GROUP BY m.id, m.title, m.release_year, m.poster_url, m.summary
                """, new MapSqlParameterSource("userId", userId), (rs, rowNum) -> new RecommendationCandidate(
                rs.getLong("id"),
                rs.getString("title"),
                rs.getInt("release_year"),
                rs.getString("poster_url"),
                rs.getBigDecimal("rating"),
                rs.getInt("rating_count"),
                rs.getString("summary") == null ? "" : rs.getString("summary"),
                new ArrayList<>(),
                0
        ));
    }

    private void fillTags(List<RecommendationCandidate> items) {
        if (items.isEmpty()) {
            return;
        }
        List<Long> ids = items.stream().map(RecommendationCandidate::id).toList();
        Map<Long, RecommendationCandidate> index = new LinkedHashMap<>();
        for (RecommendationCandidate item : items) {
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
            RecommendationCandidate item = index.get(movieId);
            if (item != null) {
                item.tags().add(tag);
            }
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

    private String normalizePoster(String posterUrl) {
        if (posterUrl == null || posterUrl.isBlank()) {
            return DEFAULT_POSTER;
        }
        return posterUrl;
    }
}

record RecommendationsResponse(
        List<RecommendationItem> items,
        String strategy
) {}

record RecommendationItem(
        long id,
        String title,
        int year,
        String poster,
        BigDecimal rating,
        String summary,
        List<String> genres,
        BigDecimal score,
        String reason
) {}

class RecommendationCandidate {
    private final long id;
    private final String title;
    private final int year;
    private final String poster;
    private final BigDecimal rating;
    private final int ratingCount;
    private final String summary;
    private final List<String> tags;
    private int tagScore;

    RecommendationCandidate(long id, String title, int year, String poster, BigDecimal rating, int ratingCount, String summary, List<String> tags, int tagScore) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.poster = poster;
        this.rating = rating;
        this.ratingCount = ratingCount;
        this.summary = summary;
        this.tags = tags;
        this.tagScore = tagScore;
    }

    long id() { return id; }
    String title() { return title; }
    int year() { return year; }
    String poster() { return poster; }
    BigDecimal rating() { return rating; }
    int ratingCount() { return ratingCount; }
    String summary() { return summary; }
    List<String> tags() { return tags; }
    int tagScore() { return tagScore; }
    void tagScore(int tagScore) { this.tagScore = tagScore; }
}
