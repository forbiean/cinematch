package com.cinematch.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}

record RegisterRequest(
        @NotBlank(message = "nickname is required")
        String nickname,
        @NotBlank(message = "email is required")
        @Email(message = "email format is invalid")
        String email,
        @NotBlank(message = "password is required")
        @Size(min = 8, message = "password length must be at least 8")
        String password
) {}

record RegisterResponse(
        Long id,
        String email,
        String role,
        String message
) {}

record LoginRequest(
        @NotBlank(message = "email is required")
        @Email(message = "email format is invalid")
        String email,
        @NotBlank(message = "password is required")
        String password
) {}

record LoginResponse(
        String token,
        String tokenType,
        long expiresIn,
        Long userId,
        String email,
        String role
) {}
