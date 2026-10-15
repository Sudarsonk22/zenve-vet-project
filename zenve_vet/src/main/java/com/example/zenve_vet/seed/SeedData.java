package com.example.zenve_vet.seed;

import java.util.List;

/**
 * Shapes of the JSON files under {@code src/main/resources/seed}.
 *
 * <p>Rows reference each other by slug and by {@code ref}, never by database id:
 * the ids are auto-increment and are not known until insert time, so a file that
 * referred to them would break the moment anyone re-ordered or re-seeded.
 */
final class SeedData {

    private SeedData() {
    }

    record VetRow(
            String slug,
            String fullName,
            String specialty,
            String city,
            String state,
            String bio,
            String avatarUrl,
            boolean verified,
            long daysAgo
    ) {
    }

    record ClinicRow(
            String vetSlug,
            String name,
            String location,
            String address,
            String phone,
            String openingHours,
            String services,
            String about,
            String photoUrl
    ) {
    }

    record PostRow(
            String ref,
            String authorSlug,
            String type,
            String category,
            String body,
            String mediaUrl,
            boolean consentReviewed,
            String takeaways,
            String topic,
            int viewCount,
            int appreciationCount,
            int commentCount,
            int shareCount,
            long hoursAgo
    ) {
    }

    record FollowRow(String followerSlug, String followingSlug) {
    }

    record CommentRow(String postRef, String authorSlug, String body, long hoursAgo) {
    }

    record AppreciationRow(String postRef, List<String> vetSlugs) {
    }

    /**
     * A seeded thread. {@code participants} is exactly two slugs; the per-person
     * flags name whose view they apply to, because pinning and archiving belong to
     * a participant rather than to the conversation.
     */
    record ConversationRow(
            List<String> participants,
            List<String> pinnedBy,
            List<String> archivedBy,
            List<String> readUpToBy,
            List<MessageRow> messages
    ) {
    }

    record MessageRow(String from, String content, long hoursAgo) {
    }

    /** A seeded short video. Likes and comments are generated around it. */
    record VideoRow(
            String creatorSlug,
            String title,
            String description,
            String videoUrl,
            String thumbnailUrl,
            Integer durationSeconds,
            String category,
            String specialty,
            String animalType,
            String caseType,
            List<String> hashtags,
            int viewCount,
            int shareCount,
            long hoursAgo
    ) {
    }
}
