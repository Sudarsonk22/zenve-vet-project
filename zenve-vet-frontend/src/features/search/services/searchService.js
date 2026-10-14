import apiClient, { normalizePage, resolveMediaUrl } from '../../../services/apiClient';
import { ENDPOINTS } from '../../../services/endpoints';
import { mapOptions, mapUser } from '../../../services/mappers';

export const SEARCH_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'people', label: 'People' },
  { id: 'videos', label: 'Short Videos' },
  { id: 'posts', label: 'Posts' },
  { id: 'cases', label: 'Clinical Cases' },
];
// Only filters the backend search endpoints are expected to accept for each content type.
export const FILTERS_BY_TYPE = {
  people: ['specialty', 'location'],
  videos: ['category', 'animalType', 'specialty', 'sort'],
  posts: ['category', 'sort'],
  cases: ['specialty', 'animalType', 'sort'],
};
export const PAGE_SIZE = 10;
export const PREVIEW_SIZE = 4;

const preview = (text, max = 220) => {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
};

const mappers = {
  people: (r) => mapUser(r),
  videos: (r) => {
    const creator = mapUser(r.creator ?? r.author ?? r.user ?? { id: r.creatorId, name: r.creatorName }) || {};
    return {
      id: r.id, title: r.title, thumbnailUrl: resolveMediaUrl(r.thumbnailUrl ?? r.thumbnail),
      creator, category: r.category?.name ?? r.category ?? null, viewCount: r.viewCount ?? r.views ?? null,
      createdAt: r.createdAt,
    };
  },
  posts: (r) => ({
    id: r.id, title: r.title || null, preview: preview(r.content ?? r.body ?? r.text),
    author: mapUser(r.author ?? r.user ?? { id: r.authorId, name: r.authorName }) || {},
    createdAt: r.createdAt ?? r.publishedAt, category: r.category?.name ?? r.category ?? null,
  }),
  cases: (r) => ({
    id: r.id, title: r.title || null, preview: preview(r.summary ?? r.description ?? r.content),
    author: mapUser(r.author ?? r.user ?? { id: r.authorId, name: r.authorName }) || {},
    createdAt: r.createdAt ?? r.publishedAt, category: r.category?.name ?? r.category ?? null,
    specialty: r.specialty ?? r.specialization ?? null, animalType: r.animalType ?? null,
  }),
  communities: (r) => ({
    id: r.id, name: r.name, description: preview(r.description, 180),
    memberCount: r.memberCount ?? r.members ?? null, avatarUrl: resolveMediaUrl(r.imageUrl ?? r.avatarUrl ?? r.logoUrl),
  }),
};

const paths = {
  people: ENDPOINTS.search.people, videos: ENDPOINTS.search.videos, posts: ENDPOINTS.search.posts,
  cases: ENDPOINTS.search.cases, communities: ENDPOINTS.search.communities,
};

// Single entry point: search one content type. Empty filter values are never sent.
export async function searchType(type, { q, page = 0, size = PAGE_SIZE, filters = {}, signal }) {
  const params = { q, page, size };
  Object.entries(filters).forEach(([k, v]) => v && (params[k] = v));
  const { data } = await apiClient.get(paths[type], { params, signal });
  const result = normalizePage(data, size);
  return { ...result, items: result.items.map(mappers[type]) };
}

export async function fetchSuggestions(q, { signal } = {}) {
  const { data } = await apiClient.get(ENDPOINTS.search.suggestions, { params: { q }, signal });
  const list = Array.isArray(data) ? data : data?.suggestions ?? [];
  return list.map((s) => (typeof s === 'string' ? s : s.text ?? s.label ?? s.name)).filter(Boolean).slice(0, 8);
}

// Filter option lists come from the backend; a failed list simply falls back to a text input.
export async function fetchFilterOptions({ signal } = {}) {
  const [specialties, animalTypes, categories] = await Promise.allSettled([
    apiClient.get(ENDPOINTS.meta.specialties, { signal }),
    apiClient.get(ENDPOINTS.meta.animalTypes, { signal }),
    apiClient.get(ENDPOINTS.videos.categories, { signal }),
  ]);
  const pick = (r) => (r.status === 'fulfilled' ? mapOptions(r.value.data) : []);
  return { specialty: pick(specialties), animalType: pick(animalTypes), category: pick(categories) };
}

export const followUser = (id) => apiClient.post(ENDPOINTS.users.follow(id));
export const unfollowUser = (id) => apiClient.delete(ENDPOINTS.users.follow(id));
