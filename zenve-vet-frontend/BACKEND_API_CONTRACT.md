# Zenve Vet - backend contract expected by the new frontend

The uploaded project contained **no backend code and no existing API client**, so these endpoints could not be
verified. They are the contract the frontend was written against. Every path is defined once in
`src/services/endpoints.js`; if a controller differs, change the path there. Anything the backend does not send is
simply hidden in the UI (nothing is invented). A missing endpoint (404/405) shows
"This feature is not available on the server yet (METHOD url)".

Base URL: `VITE_API_BASE_URL` (e.g. `http://localhost:8080/api`). Auth: `Authorization: Bearer <JWT>` on every call.
Lists may be a plain array or a Spring `Page` (`content`, `number`, `last`, `totalPages`, `totalElements`).
All "mine / liked / saved / following / unread" flags must be derived by the backend from the JWT.

## Auth
| Method | Path | Response |
|---|---|---|
| GET | `/auth/me` | `{ id, name, ... }` - used only to tell incoming from outgoing messages (unless messages carry `mine`) |

## Reference data (optional; text inputs are used when missing)
`GET /meta/specialties`, `GET /meta/animal-types`, `GET /videos/categories` -> `["Surgery", ...]` or `[{id,name}]`

## Short Videos
| Method | Path | Notes |
|---|---|---|
| GET | `/videos?feed=forYou\|following&category&q&page&size` | Page of Video |
| GET | `/videos/{id}` | Video (used by shared links `/short-videos?video=ID`) |
| POST | `/videos` | multipart: `title, description, category, animalType, specialty, visibility(PUBLIC\|FOLLOWERS\|PRIVATE), hashtags[]` + files `video`, `thumbnail`; returns Video |
| DELETE | `/videos/{id}` | owner only |
| POST / DELETE | `/videos/{id}/like` | optional response `{ likeCount }` |
| POST / DELETE | `/videos/{id}/save` | |
| GET / POST | `/videos/{id}/comments` | GET paged; POST body `{ content }` returns Comment |
| POST | `/videos/{id}/share` | share counter (best effort) |
| POST | `/videos/{id}/view` | records watch history (best effort) |
| GET | `/videos/saved`, `/videos/history` | Page of Video |
| POST / DELETE | `/users/{id}/follow` | |

Video: `{ id, title, description, videoUrl, thumbnailUrl, durationSeconds, category, specialty, animalType, hashtags[], viewCount, likeCount, commentCount, liked, saved, owner, createdAt, creator{ id, name, profileImageUrl, specialization, following } }`
Comment: `{ id, content, createdAt, author{ id, name, profileImageUrl } }`

## Messages
| Method | Path | Notes |
|---|---|---|
| GET | `/conversations?filter=all\|unread\|pinned\|archived&q` | only the caller's conversations |
| POST | `/conversations` | body `{ participantId }` -> get-or-create |
| GET | `/conversations/{id}/messages?page&size` | **page 0 = newest messages**; 403 if caller is not a participant |
| POST | `/conversations/{id}/messages` | body `{ content, replyToId?, attachmentIds? }` -> persisted Message; sender taken from JWT |
| POST | `/conversations/{id}/read` | |
| PUT / DELETE | `/conversations/{id}/pin`, `/conversations/{id}/archive` | |
| POST | `/messages/attachments` | multipart `file` -> `{ id, url, fileName, contentType, size }` |
| POST / DELETE | `/messages/{id}/reactions` | POST `{ emoji }`, DELETE `?emoji=` |

Conversation: `{ id, participant{ id, name, profileImageUrl, online? }, lastMessage{ content, createdAt }, unreadCount, pinned, archived }`
Message: `{ id, content, createdAt, senderId, mine?, status?(SENT\|DELIVERED\|READ), attachments[], replyTo?, reactions[{emoji,count,reactedByMe}] }`
Real-time: no WebSocket is assumed. The UI refreshes on tab focus and after sending. Add STOMP later in `useMessages.js`.

## Search (private messages are never searched)
`GET /search/people | videos | posts | clinical-cases | communities` with `q, page, size` plus optional filters:
people `specialty, location` - videos `category, animalType, specialty, sort=recent|views` - posts `category, sort` - cases `specialty, animalType, sort`.
`GET /search/suggestions?q=` -> `["...", ...]` (optional; suggestions switch off automatically on 404).
Person: `{ id, name, profileImageUrl, specialization, qualification, location, workplace, following? }` (`following` absent = no Follow button).
Post/Case: `{ id, title?, content|summary, author{ id, name }, createdAt, category }` - Community: `{ id, name, description, memberCount }`.

## Required Spring settings
CORS for the Vite origin (`http://localhost:5173`) with the `Authorization` header;
`spring.servlet.multipart.max-file-size` / `max-request-size` >= `VITE_MAX_VIDEO_MB`.
