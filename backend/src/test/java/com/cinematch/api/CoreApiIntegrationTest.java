package com.cinematch.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CoreApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private long movieAId;
    private long movieBId;
    private long movieCId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("DELETE FROM favorites");
        jdbcTemplate.execute("DELETE FROM ratings");
        jdbcTemplate.execute("DELETE FROM movie_tags");
        jdbcTemplate.execute("DELETE FROM movies");
        jdbcTemplate.execute("DELETE FROM users");

        jdbcTemplate.update("INSERT INTO movies(title, summary, release_year, poster_url) VALUES(?,?,?,?)",
                "Movie A", "Summary A", 2010, "https://img/a.jpg");
        jdbcTemplate.update("INSERT INTO movies(title, summary, release_year, poster_url) VALUES(?,?,?,?)",
                "Movie B", "Summary B", 2015, "https://img/b.jpg");
        jdbcTemplate.update("INSERT INTO movies(title, summary, release_year, poster_url) VALUES(?,?,?,?)",
                "Movie C", "Summary C", 2020, "https://img/c.jpg");

        movieAId = jdbcTemplate.queryForObject("SELECT id FROM movies WHERE title='Movie A'", Long.class);
        movieBId = jdbcTemplate.queryForObject("SELECT id FROM movies WHERE title='Movie B'", Long.class);
        movieCId = jdbcTemplate.queryForObject("SELECT id FROM movies WHERE title='Movie C'", Long.class);

        jdbcTemplate.update("INSERT INTO movie_tags(movie_id, tag) VALUES(?,'科幻')", movieAId);
        jdbcTemplate.update("INSERT INTO movie_tags(movie_id, tag) VALUES(?,'剧情')", movieAId);
        jdbcTemplate.update("INSERT INTO movie_tags(movie_id, tag) VALUES(?,'科幻')", movieBId);
        jdbcTemplate.update("INSERT INTO movie_tags(movie_id, tag) VALUES(?,'动画')", movieCId);
    }

    @Test
    void moviesListAndDetailShouldWork() throws Exception {
        mockMvc.perform(get("/api/movies?page=1&pageSize=2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.total").value(3));

        mockMvc.perform(get("/api/movies/" + movieAId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value((int) movieAId))
                .andExpect(jsonPath("$.title").value("Movie A"))
                .andExpect(jsonPath("$.genres.length()").value(2));
    }

    @Test
    void authRegisterAndLoginShouldWork() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"tester","email":"tester@example.com","password":"Password123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("tester@example.com"))
                .andExpect(jsonPath("$.role").value("USER"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"tester@example.com","password":"Password123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void ratingsAndFavoritesShouldPersist() throws Exception {
        registerUser("u1@example.com");
        String token = loginAndGetToken("u1@example.com");

        mockMvc.perform(post("/api/movies/" + movieAId + "/ratings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saved").value(true));

        mockMvc.perform(post("/api/movies/" + movieAId + "/ratings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":5}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(5));

        Integer score = jdbcTemplate.queryForObject(
                "SELECT score FROM ratings r JOIN users u ON u.id=r.user_id WHERE u.email='u1@example.com' AND r.movie_id=?",
                Integer.class, movieAId);
        assertThat(score).isEqualTo(5);

        mockMvc.perform(post("/api/movies/" + movieBId + "/favorite")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.favorite").value(true));

        mockMvc.perform(delete("/api/movies/" + movieBId + "/favorite")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.favorite").value(false));
    }

    @Test
    void recommendationsShouldExcludeRatedAndFavoritedMovies() throws Exception {
        registerUser("u2@example.com");
        String token = loginAndGetToken("u2@example.com");

        mockMvc.perform(post("/api/movies/" + movieAId + "/ratings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":5}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/movies/" + movieBId + "/favorite")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        String body = mockMvc.perform(get("/api/recommendations")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(body);
        for (JsonNode item : root.path("items")) {
            long movieId = item.path("id").asLong();
            assertThat(movieId).isNotIn(movieAId, movieBId);
        }
    }

    private void registerUser(String email) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"tester","email":"%s","password":"Password123"}
                                """.formatted(email)))
                .andExpect(status().isOk());
    }

    private String loginAndGetToken(String email) throws Exception {
        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"Password123"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(loginBody).path("token").asText();
    }
}
