import { resolveMediaUrl } from './apiClient';

// Adapts a backend user object to the shape the UI uses. No data is invented:
// anything the backend does not send stays undefined/null and the UI hides it.
export function mapUser(raw) {
  if (!raw) return null;
  const name =
    raw.name ||
    raw.fullName ||
    raw.displayName ||
    [raw.firstName, raw.lastName].filter(Boolean).join(' ') ||
    null;
  return {
    id: raw.id ?? raw.userId,
    name,
    avatarUrl: resolveMediaUrl(raw.profileImageUrl ?? raw.avatarUrl ?? raw.profileImage ?? raw.imageUrl),
    specialization: raw.specialization ?? raw.specialty ?? null,
    qualification: raw.qualification ?? raw.degree ?? null,
    location: raw.location ?? raw.city ?? null,
    workplace: raw.workplace ?? raw.clinic ?? raw.organization ?? null,
    bio: raw.bio ?? raw.about ?? null,
    online: typeof raw.online === 'boolean' ? raw.online : undefined,
    // undefined means "backend does not tell us" -> Follow button is hidden
    following: raw.following ?? raw.followedByMe ?? raw.isFollowing,
    isSelf: Boolean(raw.self ?? raw.isSelf ?? raw.me),
  };
}

export const toList = (value) => (Array.isArray(value) ? value : []);

// Option lists (specialties, categories...) may be ["A","B"] or [{id,name}].
export function mapOptions(data) {
  const list = Array.isArray(data) ? data : data?.content ?? [];
  return list
    .map((o) => (typeof o === 'string' ? { value: o, label: o } : { value: o.name ?? o.value ?? o.id, label: o.name ?? o.label ?? o.value }))
    .filter((o) => o.value !== undefined && o.value !== null && o.label);
}
