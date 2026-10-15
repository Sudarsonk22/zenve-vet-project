package com.example.zenve_vet.shortvideo.dto;

/** Returned by like/save/share so the UI can show the new number without a refetch. */
public record CountResponse(long likeCount, long shareCount, boolean liked, boolean saved) {
}
