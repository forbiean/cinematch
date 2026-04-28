package com.cinematch.api;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminDashboardService {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AdminDashboardService(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public AdminDashboardResponse getDashboard() {
        long movieTotal = getLong("SELECT COUNT(*) FROM movies");
        long userTotal = getLong("SELECT COUNT(*) FROM users");
        long todayRatings = getLong("""
                SELECT COUNT(*)
                FROM ratings
                WHERE DATE(created_at) = CURRENT_DATE()
                """);
        long yesterdayRatings = getLong("""
                SELECT COUNT(*)
                FROM ratings
                WHERE DATE(created_at) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
                """);
        long weekNewMovies = getLong("""
                SELECT COUNT(*)
                FROM movies
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                """);
        long weekNewUsers = getLong("""
                SELECT COUNT(*)
                FROM users
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                """);
        long usersWithFavorite = getLong("""
                SELECT COUNT(DISTINCT user_id)
                FROM favorites
                """);
        BigDecimal favoriteRate = userTotal == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(usersWithFavorite * 100.0 / userTotal).setScale(1, RoundingMode.HALF_UP);

        BigDecimal todayDeltaPct = BigDecimal.ZERO;
        if (yesterdayRatings > 0) {
            todayDeltaPct = BigDecimal.valueOf((todayRatings - yesterdayRatings) * 100.0 / yesterdayRatings)
                    .setScale(1, RoundingMode.HALF_UP);
        }

        List<AdminDailyTrendItem> trend = buildTrend();
        List<AdminHotTagItem> hotTags = buildHotTags();

        return new AdminDashboardResponse(
                new AdminOverview(
                        movieTotal,
                        weekNewMovies,
                        userTotal,
                        weekNewUsers,
                        todayRatings,
                        todayDeltaPct,
                        favoriteRate
                ),
                trend,
                hotTags
        );
    }

    private List<AdminDailyTrendItem> buildTrend() {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(today.getDayOfWeek().getValue() - 1L);
        LocalDate end = start.plusDays(6);
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT DATE(created_at) d, COUNT(*) c
                FROM ratings
                WHERE DATE(created_at) BETWEEN :startDate AND :endDate
                GROUP BY DATE(created_at)
                """, new MapSqlParameterSource()
                .addValue("startDate", start)
                .addValue("endDate", end));

        Map<LocalDate, Long> dailyCount = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            Object dateObj = row.get("d");
            LocalDate date = dateObj instanceof java.sql.Date sqlDate
                    ? sqlDate.toLocalDate()
                    : LocalDate.parse(String.valueOf(dateObj));
            dailyCount.put(date, ((Number) row.get("c")).longValue());
        }

        long max = 0;
        for (long value : dailyCount.values()) {
            if (value > max) {
                max = value;
            }
        }

        List<AdminDailyTrendItem> trend = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = start.plusDays(i);
            long count = dailyCount.getOrDefault(date, 0L);
            int pct = max == 0 ? 0 : (int) Math.max(8, Math.round(count * 100.0 / max));
            trend.add(new AdminDailyTrendItem(toWeekdayZh(date.getDayOfWeek()), count, pct));
        }
        return trend;
    }

    private List<AdminHotTagItem> buildHotTags() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT mt.tag tag, COUNT(*) cnt
                FROM ratings r
                JOIN movie_tags mt ON mt.movie_id = r.movie_id
                GROUP BY mt.tag
                ORDER BY cnt DESC, mt.tag ASC
                LIMIT 8
                """, new MapSqlParameterSource());

        long total = 0;
        for (Map<String, Object> row : rows) {
            total += ((Number) row.get("cnt")).longValue();
        }

        List<AdminHotTagItem> tags = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            String name = String.valueOf(row.get("tag"));
            long count = ((Number) row.get("cnt")).longValue();
            BigDecimal pct = total == 0
                    ? BigDecimal.ZERO
                    : BigDecimal.valueOf(count * 100.0 / total).setScale(1, RoundingMode.HALF_UP);
            tags.add(new AdminHotTagItem(name, count, pct));
        }
        return tags;
    }

    private long getLong(String sql) {
        Long value = jdbcTemplate.queryForObject(sql, new MapSqlParameterSource(), Long.class);
        return value == null ? 0 : value;
    }

    private String toWeekdayZh(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "周一";
            case TUESDAY -> "周二";
            case WEDNESDAY -> "周三";
            case THURSDAY -> "周四";
            case FRIDAY -> "周五";
            case SATURDAY -> "周六";
            case SUNDAY -> "周日";
        };
    }
}

record AdminDashboardResponse(
        AdminOverview overview,
        List<AdminDailyTrendItem> trend,
        List<AdminHotTagItem> hotTags
) {}

record AdminOverview(
        long movieTotal,
        long weekNewMovies,
        long userTotal,
        long weekNewUsers,
        long todayRatings,
        BigDecimal todayRatingsDeltaPct,
        BigDecimal favoriteRate
) {}

record AdminDailyTrendItem(
        String day,
        long count,
        int pct
) {}

record AdminHotTagItem(
        String name,
        long count,
        BigDecimal pct
) {}
