package com.cinematch.api;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(NamedParameterJdbcTemplate jdbcTemplate, JwtService jwtService) {
        this.jdbcTemplate = jdbcTemplate;
        this.jwtService = jwtService;
    }

    public RegisterResponse register(RegisterRequest request) {
        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("email", request.email().trim().toLowerCase())
                .addValue("passwordHash", passwordEncoder.encode(request.password()))
                .addValue("role", "USER");

        try {
            jdbcTemplate.update("""
                    INSERT INTO users(email, password_hash, role)
                    VALUES (:email, :passwordHash, :role)
                    """, params, keyHolder);
        } catch (DuplicateKeyException ex) {
            throw new ResponseStatusException(CONFLICT, "email already registered");
        }

        Number key = keyHolder.getKey();
        Long id = key == null ? null : key.longValue();
        return new RegisterResponse(id, request.email().trim().toLowerCase(), "USER", "register success");
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        List<UserCredential> rows = jdbcTemplate.query("""
                SELECT id, email, password_hash, role
                FROM users
                WHERE email = :email
                LIMIT 1
                """, new MapSqlParameterSource("email", email), (rs, rowNum) -> new UserCredential(
                rs.getLong("id"),
                rs.getString("email"),
                rs.getString("password_hash"),
                rs.getString("role")
        ));

        if (rows.isEmpty()) {
            throw new ResponseStatusException(UNAUTHORIZED, "invalid email or password");
        }

        UserCredential user = rows.get(0);
        if (!passwordEncoder.matches(request.password(), user.passwordHash())) {
            throw new ResponseStatusException(UNAUTHORIZED, "invalid email or password");
        }

        String token = jwtService.issueToken(user.id(), user.email(), user.role());
        return new LoginResponse(token, "Bearer", jwtService.getExpireSeconds(), user.id(), user.email(), user.role());
    }
}

record UserCredential(
        Long id,
        String email,
        String passwordHash,
        String role
) {}
