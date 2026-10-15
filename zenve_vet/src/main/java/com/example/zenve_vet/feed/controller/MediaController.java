package com.example.zenve_vet.feed.controller;

import com.example.zenve_vet.shortvideo.service.VideoStorage;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/posts/media")
public class MediaController {

    private final VideoStorage storage;

    public MediaController(VideoStorage storage) {
        this.storage = storage;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        String type = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        String url = type.startsWith("video/") ? storage.storeVideo(file) : storage.storeImage(file);
        return Map.of("url", url);
    }
}