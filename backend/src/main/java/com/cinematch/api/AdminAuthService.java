package com.cinematch.api;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AdminAuthService {

    private final JwtService jwtService;

    public AdminAuthService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public void requireAdmin(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(UNAUTHORIZED, "missing token");
        }
        String token = authorization.substring("Bearer ".length()).trim();
        Map<String, Object> claims = jwtService.parseToken(token);
        if (claims == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "invalid token");
        }
        String role = String.valueOf(claims.getOrDefault("role", ""));
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(FORBIDDEN, "admin only");
        }
    }
}

