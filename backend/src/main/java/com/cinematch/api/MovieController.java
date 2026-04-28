package com.cinematch.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MovieController {

    private final MovieQueryService movieQueryService;

    public MovieController(MovieQueryService movieQueryService) {
        this.movieQueryService = movieQueryService;
    }

    @GetMapping("/movies")
    public MoviesPageResponse listMovies(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int pageSize,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "all") String genre,
            @RequestParam(defaultValue = "rating") String sort
    ) {
        return movieQueryService.listMovies(page, pageSize, query, genre, sort);
    }

    @GetMapping("/movies/{id}")
    public MovieDetailResponse movieDetail(@PathVariable Long id) {
        return movieQueryService.getMovieDetail(id);
    }
}
