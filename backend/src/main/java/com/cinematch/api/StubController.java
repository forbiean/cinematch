package com.cinematch.api;

import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class StubController {

  @PostMapping("/admin/movies")
  public Map<String, Object> adminCreate() { return Map.of("created", true); }

  @PatchMapping("/admin/movies/{id}")
  public Map<String, Object> adminUpdate(@PathVariable Long id) { return Map.of("updated", true, "id", id); }
}
