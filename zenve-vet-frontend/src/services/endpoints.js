// THE REST CONTRACT THE FRONTEND EXPECTS FROM THE SPRING BOOT BACKEND.
// Every URL used by the three modules lives here, relative to VITE_API_BASE_URL.
// If a path differs in your controllers, change it here - nowhere else.
// Request/response shapes are documented in BACKEND_API_CONTRACT.md.
export const ENDPOINTS = {
  auth: {
    me: '/auth/me',
  },
  meta: {
    specialties: '/meta/specialties',
    animalTypes: '/meta/animal-types',
  },
  users: {
    profile: (id) => `/users/${id}`,
    follow: (id) => `/users/${id}/follow`, // POST = follow, DELETE = unfollow
  },
  videos: {
    list: '/videos', // GET ?feed=forYou|following&category&q&page&size
    categories: '/videos/categories',
    upload: '/videos', // POST multipart/form-data
    detail: (id) => `/videos/${id}`, // GET, DELETE
    like: (id) => `/videos/${id}/like`, // POST / DELETE
    save: (id) => `/videos/${id}/save`, // POST / DELETE
    comments: (id) => `/videos/${id}/comments`, // GET, POST
    share: (id) => `/videos/${id}/share`, // POST (share counter)
    view: (id) => `/videos/${id}/view`, // POST (feeds watch history)
    saved: '/videos/saved',
    history: '/videos/history',
  },
  conversations: {
    list: '/conversations', // GET ?filter=all|unread|pinned|archived&q ; POST {participantId}
    messages: (id) => `/conversations/${id}/messages`, // GET ?page&size ; POST
    read: (id) => `/conversations/${id}/read`, // POST
    pin: (id) => `/conversations/${id}/pin`, // PUT / DELETE
    archive: (id) => `/conversations/${id}/archive`, // PUT / DELETE
  },
  messages: {
    attachments: '/messages/attachments', // POST multipart
    reactions: (id) => `/messages/${id}/reactions`, // POST {emoji} / DELETE ?emoji=
  },
  search: {
    people: '/search/people',
    videos: '/search/videos',
    posts: '/search/posts',
    cases: '/search/clinical-cases',
    communities: '/search/communities',
    suggestions: '/search/suggestions',
  },
};
