package com.cinematch.api;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MovieController {

    private final MovieQueryService movieQueryService;
    private final MovieActionService movieActionService;

    public MovieController(MovieQueryService movieQueryService, MovieActionService movieActionService) {
        this.movieQueryService = movieQueryService;
        this.movieActionService = movieActionService;
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

    @PostMapping("/movies/{id}/ratings")
    public RatingSaveResponse rateMovie(
            @PathVariable Long id,
            @Valid @RequestBody RatingRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return movieActionService.rateMovie(id, request, authorization);
    }

    @PostMapping("/movies/{id}/favorite")
    public FavoriteResponse favoriteMovie(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return movieActionService.favoriteMovie(id, authorization);
    }

    @DeleteMapping("/movies/{id}/favorite")
    public FavoriteResponse unfavoriteMovie(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return movieActionService.unfavoriteMovie(id, authorization);
    }
}
