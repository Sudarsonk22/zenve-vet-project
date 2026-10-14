// Front-end route targets used by links inside the three modules.
// Adjust the ones that point outside these modules (profile, post, community, case)
// so they match the routes of your existing pages.
export const appRoutes = {
  login: import.meta.env.VITE_LOGIN_ROUTE || '/login',
  shortVideos: '/short-videos',
  savedVideos: '/short-videos/saved',
  watchHistory: '/short-videos/history',
  video: (id) => `/short-videos?video=${encodeURIComponent(id)}`,
  messages: '/messages',
  messageUser: (userId) => `/messages?userId=${encodeURIComponent(userId)}`,
  search: '/search',
  advertise: '/advertise',
  benefits: '/benefits',
  profile: (id) => `/profile/${id}`,
  createProfessionalPage: '/professional/new',
  advantage: (topic) => `/advantage/${topic}`,
  memberBenefits: '/member-benefits',
  post: (id) => `/posts/${id}`,
  clinicalCase: (id) => `/cases/${id}`,
  community: (id) => `/communities/${id}`,
};
