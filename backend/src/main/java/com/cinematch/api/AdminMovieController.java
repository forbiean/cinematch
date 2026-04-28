package com.cinematch.api;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminMovieController {

    private final AdminMovieService adminMovieService;
    private final AdminDashboardService adminDashboardService;
    private final AdminAuthService adminAuthService;

    public AdminMovieController(
            AdminMovieService adminMovieService,
            AdminDashboardService adminDashboardService,
            AdminAuthService adminAuthService
    ) {
        this.adminMovieService = adminMovieService;
        this.adminDashboardService = adminDashboardService;
        this.adminAuthService = adminAuthService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse dashboard(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        adminAuthService.requireAdmin(authorization);
        return adminDashboardService.getDashboard();
    }

    @GetMapping("/movies")
    public AdminMoviesPageResponse movies(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        adminAuthService.requireAdmin(authorization);
        return adminMovieService.listMovies(page, pageSize);
    }

    @PostMapping("/movies")
    public AdminMovieCreateResponse createMovie(
            @Valid @RequestBody AdminMovieCreateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        adminAuthService.requireAdmin(authorization);
        return adminMovieService.createMovie(request);
    }

    @PatchMapping("/movies/{id}")
    public AdminMovieUpdateResponse updateMovie(
            @PathVariable Long id,
            @Valid @RequestBody AdminMovieUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        adminAuthService.requireAdmin(authorization);
        return adminMovieService.updateMovie(id, request);
    }
}
