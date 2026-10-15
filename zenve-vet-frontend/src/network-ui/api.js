const BASE = 'http://localhost:8080/api';

export const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=240&q=85';

const KEY = 'zenve-vet-me';
const DEFAULT_ME = 1;

export function getMeId() {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? Number(saved) : DEFAULT_ME;
  } catch {
    return DEFAULT_ME;
  }
}

export function setMeId(id) {
  try {
    localStorage.setItem(KEY, String(id));
  } catch {
    // ignore
  }
}

export function clearMeId() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

function query(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value);
    }
  });
  const text = search.toString();
  return text ? '?' + text : '';
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = data?.message || 'Something went wrong';
    if (data?.fieldErrors) {
      message = Object.values(data.fieldErrors)[0] || message;
    }
    throw new Error(message);
  }
  return data;
}

function mapVet(v) {
  return {
    id: v.id,
    slug: v.slug,
    name: v.fullName,
    specialty: v.specialty,
    city: v.city,
    state: v.state,
    about: v.bio,
    image: v.avatarUrl || DEFAULT_IMAGE,
    verified: v.verified,
    followersCount: v.followersCount,
    followingCount: v.followingCount,
    following: v.following,
    example: false,
  };
}

// vets
export async function getVets(viewerId) {
  const page = await request('/vets' + query({ size: 100, viewerId }));
  return page.items.map(mapVet);
}

export async function getVet(slug, viewerId) {
  return mapVet(await request(`/vets/${slug}` + query({ viewerId })));
}

export async function createVet(form) {
  const vet = await request('/vets', { method: 'POST', body: JSON.stringify(form) });
  return mapVet(vet);
}

export async function updateVet(id, form) {
  const vet = await request(`/vets/${id}`, { method: 'PUT', body: JSON.stringify(form) });
  return mapVet(vet);
}

export function deleteVet(id) {
  return request(`/vets/${id}`, { method: 'DELETE' });
}

export function getSpecialties() {
  return request('/vets/specialties');
}

export function getStates() {
  return request('/vets/states');
}

export function follow(vetId, followerId) {
  return request(`/vets/${vetId}/follow`, {
    method: 'POST',
    body: JSON.stringify({ followerId }),
  });
}

export function unfollow(vetId, followerId) {
  return request(`/vets/${vetId}/follow` + query({ followerId }), {
    method: 'DELETE',
    body: JSON.stringify({ followerId }),
  });
}

// posts
export function getPosts(params) {
  return request('/posts' + query(params));
}

export function createPost(body) {
  return request('/posts', { method: 'POST', body: JSON.stringify(body) });
}

export function appreciate(postId, vetId) {
  return request(`/posts/${postId}/appreciate`, {
    method: 'POST',
    body: JSON.stringify({ vetId }),
  });
}

export function unappreciate(postId, vetId) {
  return request(`/posts/${postId}/appreciate` + query({ vetId }), { method: 'DELETE' });
}

export function savePost(postId, vetId) {
  return request(`/posts/${postId}/save`, {
    method: 'POST',
    body: JSON.stringify({ vetId }),
  });
}

export function unsavePost(postId, vetId) {
  return request(`/posts/${postId}/save` + query({ vetId }), { method: 'DELETE' });
}

export function getComments(postId) {
  return request(`/posts/${postId}/comments`);
}

export function addComment(postId, authorId, body) {
  return request(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ authorId, body }),
  });
}

export function sharePost(postId) {
  return request(`/posts/${postId}/share`, { method: 'POST' });
}

export function viewPost(postId) {
  return request(`/posts/${postId}/view`, { method: 'POST' });
}

export function reportPost(postId, reporterId, reason, details) {
  return request(`/posts/${postId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reporterId, reason, details }),
  });
}

// search
/**
 * One call behind the whole Discover page.
 *
 * Doctors come back through `mapVet` so `ProfileCard` can render them unchanged,
 * while posts are left in their server shape because that is exactly what
 * `PostCard` already consumes - neither card needed a second mapping path.
 */
export async function searchAll({ q, topic, state, verifiedOnly, hasTakeaways, tab, page, size, viewerId }) {
  const data = await request('/search' + query({
    q, topic, state, verifiedOnly, hasTakeaways, tab, page, size, viewerId,
  }));
  return {
    ...data,
    doctors: (data.doctors || []).map(mapVet),
    posts: data.posts || [],
  };
}

export function getSearchTopics() {
  return request('/search/topics');
}

export function getStories() {
  return request('/posts/stories');
}

// media
const ORIGIN = BASE.replace(/\/api$/, '');

export function mediaSrc(url) {
  if (!url) return '';
  return /^(https?:|blob:|data:)/i.test(url) ? url : ORIGIN + url;
}

export async function uploadMedia(file) {
  const form = new FormData();
  form.append('file', file);

  let response;
  try {
    response = await fetch(BASE + '/posts/media', { method: 'POST', body: form });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'Upload failed');
  }
  return data.url;
}