import apiClient, { normalizePage, resolveMediaUrl } from '../../../services/apiClient';
import { ENDPOINTS } from '../../../services/endpoints';
import { mapUser, mapOptions } from '../../../services/mappers';

export const PAGE_SIZE = 6;

const normalizeTags = (tags) => {
  const list = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(/[\s,]+/) : [];
  return list.map((t) => String(t).replace(/^#+/, '').trim()).filter(Boolean);
};

export function mapVideo(raw) {
  const creator = mapUser(raw.creator ?? raw.author ?? raw.user ?? { id: raw.creatorId, name: raw.creatorName }) || {};
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    videoUrl: resolveMediaUrl(raw.videoUrl ?? raw.url),
    thumbnailUrl: resolveMediaUrl(raw.thumbnailUrl ?? raw.thumbnail),
    durationSeconds: raw.durationSeconds ?? raw.duration ?? null,
    category: raw.category?.name ?? raw.category ?? null,
    specialty: raw.specialty ?? raw.specialization ?? null,
    animalType: raw.animalType ?? null,
    hashtags: normalizeTags(raw.hashtags ?? raw.tags),
    viewCount: raw.viewCount ?? raw.views ?? null,
    likeCount: raw.likeCount ?? raw.likes ?? 0,
    commentCount: raw.commentCount ?? raw.comments ?? 0,
    liked: Boolean(raw.liked ?? raw.likedByMe),
    saved: Boolean(raw.saved ?? raw.savedByMe),
    isOwner: Boolean(raw.owner ?? raw.mine ?? raw.isOwner),
    createdAt: raw.createdAt,
    creator,
  };
}

export function mapComment(raw) {
  return {
    id: raw.id,
    text: raw.content ?? raw.text ?? raw.body ?? '',
    createdAt: raw.createdAt,
    author: mapUser(raw.author ?? raw.user ?? { id: raw.userId, name: raw.userName }) || {},
  };
}

const toPage = (data, size) => {
  const page = normalizePage(data, size);
  return { ...page, items: page.items.map(mapVideo) };
};

export async function fetchVideos({ feed = 'forYou', category, animalType, specialty, state, caseType, q, page = 0, size = PAGE_SIZE, signal }) {
  const params = { feed, page, size };
  if (category) params.category = category;
  if (animalType) params.animalType = animalType;
  if (specialty) params.specialty = specialty;
  if (state) params.state = state;
  if (caseType) params.caseType = caseType;
  if (q) params.q = q;
  const { data } = await apiClient.get(ENDPOINTS.videos.list, { params, signal });
  return toPage(data, size);
}

export async function fetchSavedVideos({ page = 0, size = PAGE_SIZE, signal }) {
  const { data } = await apiClient.get(ENDPOINTS.videos.saved, { params: { page, size }, signal });
  return toPage(data, size);
}

export async function fetchWatchHistory({ page = 0, size = PAGE_SIZE, signal }) {
  const { data } = await apiClient.get(ENDPOINTS.videos.history, { params: { page, size }, signal });
  return toPage(data, size);
}

export async function fetchVideoById(id, { signal } = {}) {
  const { data } = await apiClient.get(ENDPOINTS.videos.detail(id), { signal });
  return mapVideo(data);
}

export async function fetchCategories({ signal } = {}) {
  const { data } = await apiClient.get(ENDPOINTS.videos.categories, { signal });
  return mapOptions(data);
}

export async function fetchSpecialties({ signal } = {}) {
  const { data } = await apiClient.get(ENDPOINTS.meta.specialties, { signal });
  return mapOptions(data);
}

export async function fetchAnimalTypes({ signal } = {}) {
  const { data } = await apiClient.get(ENDPOINTS.meta.animalTypes, { signal });
  return mapOptions(data);
}

export async function uploadVideo(values, { onProgress, signal } = {}) {
  const form = new FormData();
  form.append('title', values.title);
  form.append('description', values.description || '');
  form.append('category', values.category);
  if (values.animalType) form.append('animalType', values.animalType);
  if (values.specialty) form.append('specialty', values.specialty);
  form.append('visibility', values.visibility);
  values.hashtags.forEach((tag) => form.append('hashtags', tag));
  form.append('video', values.videoFile);
  if (values.thumbnailFile) form.append('thumbnail', values.thumbnailFile);

  const { data } = await apiClient.post(ENDPOINTS.videos.upload, form, {
    signal,
    timeout: 0,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data ? mapVideo(data) : null;
}

export const deleteVideo = (id) => apiClient.delete(ENDPOINTS.videos.detail(id));

export async function likeVideo(id) {
  const { data } = await apiClient.post(ENDPOINTS.videos.like(id));
  return data;
}
export async function unlikeVideo(id) {
  const { data } = await apiClient.delete(ENDPOINTS.videos.like(id));
  return data;
}
export async function saveVideo(id) {
  const { data } = await apiClient.post(ENDPOINTS.videos.save(id));
  return data;
}
export async function unsaveVideo(id) {
  const { data } = await apiClient.delete(ENDPOINTS.videos.save(id));
  return data;
}
export const followCreator = (userId) => apiClient.post(ENDPOINTS.users.follow(userId));
export const unfollowCreator = (userId) => apiClient.delete(ENDPOINTS.users.follow(userId));

export const recordShare = (id) => apiClient.post(ENDPOINTS.videos.share(id));
export const recordView = (id) => apiClient.post(ENDPOINTS.videos.view(id));

export async function fetchComments(videoId, { page = 0, size = 10, signal } = {}) {
  const { data } = await apiClient.get(ENDPOINTS.videos.comments(videoId), { params: { page, size }, signal });
  const result = normalizePage(data, size);
  return { ...result, items: result.items.map(mapComment) };
}

export async function addComment(videoId, text) {
  const { data } = await apiClient.post(ENDPOINTS.videos.comments(videoId), { content: text });
  return mapComment(data);
}
