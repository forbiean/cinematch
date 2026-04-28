package com.cinematch.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminMovieController {

    private final AdminMovieService adminMovieService;

    public AdminMovieController(AdminMovieService adminMovieService) {
        this.adminMovieService = adminMovieService;
    }

    @GetMapping("/movies")
    public AdminMoviesPageResponse movies(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        return adminMovieService.listMovies(page, pageSize);
    }

    @PostMapping("/movies")
    public AdminMovieCreateResponse createMovie(@RequestBody AdminMovieCreateRequest request) {
        return adminMovieService.createMovie(request);
    }

    @PatchMapping("/movies/{id}")
    public AdminMovieUpdateResponse updateMovie(
            @PathVariable Long id,
            @RequestBody AdminMovieUpdateRequest request
    ) {
        return adminMovieService.updateMovie(id, request);
    }
}
