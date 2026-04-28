package com.cinematch.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api")
public class StubController {

  @GetMapping("/recommendations")
  public Map<String, Object> recommendations() {
    return Map.of("items", List.of(Map.of("movieId", 1, "title", "Interstellar", "score", 0.91, "reason", "你近期给高分的科幻与冒险标签影片较多")));
  }

  @PostMapping("/admin/movies")
  public Map<String, Object> adminCreate() { return Map.of("created", true); }

  @PatchMapping("/admin/movies/{id}")
  public Map<String, Object> adminUpdate(@PathVariable Long id) { return Map.of("updated", true, "id", id); }
}
