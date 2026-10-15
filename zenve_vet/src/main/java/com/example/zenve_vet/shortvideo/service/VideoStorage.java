package com.example.zenve_vet.shortvideo.service;

import com.example.zenve_vet.common.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Writes uploaded videos and thumbnails to disk and reads them back.
 *
 * <p>Same rules as message attachments: the stored name is a fresh UUID and never
 * the client's, which can contain path separators or {@code ..}; the type is
 * checked against an allow-list; and every resolved path is confirmed to sit inside
 * the uploads root before anything is written or read.
 */
@Service
public class VideoStorage {

    private static final Set<String> VIDEO_TYPES = Set.of(
            "video/mp4", "video/webm", "video/quicktime", "video/x-m4v");

    private static final Set<String> IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp");

    private final Path root;

    public VideoStorage(@Value("${app.uploads.dir:./uploads}") String uploadsDir) {
        this.root = Paths.get(uploadsDir).toAbsolutePath().normalize();
    }

    public String storeVideo(MultipartFile file) {
        return store(file, VIDEO_TYPES, "videos");
    }

    public String storeImage(MultipartFile file) {
        return store(file, IMAGE_TYPES, "thumbnails");
    }

    /** @return the URL the API will serve this file at */
    private String store(MultipartFile file, Set<String> allowed, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was uploaded.");
        }

        String contentType = file.getContentType() == null
                ? "application/octet-stream"
                : file.getContentType().toLowerCase(Locale.ROOT);
        if (!allowed.contains(contentType)) {
            throw new BadRequestException("That file type is not allowed: " + contentType);
        }

        String extension = StringUtils.getFilenameExtension(
                StringUtils.getFilename(file.getOriginalFilename()));
        String relative = folder + "/" + LocalDate.now() + "/" + UUID.randomUUID()
                + (extension == null ? "" : "." + extension.toLowerCase(Locale.ROOT));

        try {
            Path target = root.resolve(relative).normalize();
            if (!target.startsWith(root)) {
                throw new BadRequestException("Invalid upload path.");
            }
            Files.createDirectories(target.getParent());
            file.transferTo(target);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not store the upload", e);
        }

        return "/api/videos/files/" + relative;
    }

    public Optional<StoredFile> read(String relative) {
        Path file = root.resolve(relative).normalize();
        // The request path is attacker-controlled, so this check is the one that matters.
        if (!file.startsWith(root) || !Files.exists(file) || Files.isDirectory(file)) {
            return Optional.empty();
        }
        try {
            String type = Files.probeContentType(file);
            return Optional.of(new StoredFile(
                    new FileSystemResource(file),
                    type == null ? "application/octet-stream" : type));
        } catch (IOException e) {
            return Optional.empty();
        }
    }

    public record StoredFile(Resource resource, String contentType) {
    }
}
