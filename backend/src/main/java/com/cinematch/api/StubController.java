package com.cinematch.api;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class StubController {

  @PostMapping("/movies/{id}/ratings")
  public Map<String, Object> rate(@PathVariable Long id) { return Map.of("movieId", id, "saved", true); }

  @PostMapping("/movies/{id}/favorite")
  public Map<String, Object> favorite(@PathVariable Long id) { return Map.of("movieId", id, "favorite", true); }

  @DeleteMapping("/movies/{id}/favorite")
  public Map<String, Object> unfavorite(@PathVariable Long id) { return Map.of("movieId", id, "favorite", false); }

  @GetMapping("/recommendations")
  public Map<String, Object> recommendations() {
    return Map.of("items", List.of(Map.of("movieId", 1, "title", "Interstellar", "score", 0.91, "reason", "你近期给高分的科幻与冒险标签影片较多")));
  }

  @PostMapping("/admin/movies")
  public Map<String, Object> adminCreate() { return Map.of("created", true); }

  @PatchMapping("/admin/movies/{id}")
  public Map<String, Object> adminUpdate(@PathVariable Long id) { return Map.of("updated", true, "id", id); }
}
