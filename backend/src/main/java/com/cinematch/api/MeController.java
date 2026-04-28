package com.cinematch.api;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final MeService meService;

    public MeController(MeService meService) {
        this.meService = meService;
    }

    @GetMapping("/profile")
    public MeProfileResponse profile(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return meService.profile(authorization);
    }

    @GetMapping("/ratings")
    public List<MyRatingItem> myRatings(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return meService.myRatings(authorization);
    }

    @GetMapping("/favorites")
    public List<MovieListItem> myFavorites(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return meService.myFavorites(authorization);
    }

    @PatchMapping("/profile")
    public MeProfileUpdateResponse updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody MeProfileUpdateRequest request
    ) {
        return meService.updateProfile(authorization, request);
    }
}
