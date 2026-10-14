import apiClient, { normalizePage, resolveMediaUrl } from '../../../services/apiClient';
import { ENDPOINTS } from '../../../services/endpoints';
import { mapUser } from '../../../services/mappers';

export const MESSAGE_PAGE_SIZE = 30;
const MAX_ATTACHMENT_MB = Number(import.meta.env.VITE_MAX_ATTACHMENT_MB) || 10;
export const ATTACHMENT_LIMIT_BYTES = MAX_ATTACHMENT_MB * 1048576;
export const ATTACHMENT_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,.xls,.xlsx,.txt';

export function mapAttachment(raw) {
  const type = raw.contentType ?? raw.mimeType ?? raw.type ?? '';
  return {
    id: raw.id,
    url: resolveMediaUrl(raw.url ?? raw.fileUrl),
    name: raw.fileName ?? raw.name ?? 'Attachment',
    isImage: String(type).startsWith('image/') || raw.kind === 'IMAGE',
    size: raw.size ?? raw.fileSize ?? null,
  };
}

export function mapMessage(raw) {
  const reactions = {};
  (Array.isArray(raw.reactions) ? raw.reactions : []).forEach((r) => {
    const entry = reactions[r.emoji] || { emoji: r.emoji, count: 0, reactedByMe: false };
    entry.count += r.count ?? 1;
    entry.reactedByMe = entry.reactedByMe || Boolean(r.reactedByMe ?? r.mine);
    reactions[r.emoji] = entry;
  });
  const reply = raw.replyTo ?? raw.repliedTo;
  return {
    id: raw.id,
    conversationId: raw.conversationId,
    text: raw.content ?? raw.text ?? raw.body ?? '',
    createdAt: raw.createdAt ?? raw.sentAt,
    senderId: raw.senderId ?? raw.sender?.id,
    mine: raw.mine ?? raw.isMine ?? raw.fromMe, // preferred: the backend decides from the JWT
    status: raw.status ?? (raw.readAt ? 'READ' : raw.deliveredAt ? 'DELIVERED' : undefined),
    attachments: (Array.isArray(raw.attachments) ? raw.attachments : []).map(mapAttachment),
    replyTo: reply ? { id: reply.id, text: reply.content ?? reply.text ?? '', senderName: reply.senderName ?? reply.sender?.name } : null,
    reactions: Object.values(reactions),
  };
}

export function mapConversation(raw) {
  const last = raw.lastMessage;
  return {
    id: raw.id,
    participant: mapUser(raw.participant ?? raw.otherUser ?? raw.user) || {},
    preview: typeof last === 'string' ? last : last?.content ?? last?.text ?? raw.lastMessagePreview ?? '',
    lastMessageAt: raw.lastMessageAt ?? last?.createdAt ?? raw.updatedAt,
    unreadCount: raw.unreadCount ?? 0,
    pinned: Boolean(raw.pinned),
    archived: Boolean(raw.archived),
  };
}

// Current authenticated user, as known by the backend (used to tell incoming from outgoing).
export async function fetchCurrentUser({ signal } = {}) {
  const { data } = await apiClient.get(ENDPOINTS.auth.me, { signal });
  return mapUser(data);
}

export async function fetchConversations({ filter = 'all', q = '', signal } = {}) {
  const params = { filter };
  if (q) params.q = q;
  const { data } = await apiClient.get(ENDPOINTS.conversations.list, { params, signal });
  return normalizePage(data, 50).items.map(mapConversation);
}

export async function startConversation(participantId) {
  const { data } = await apiClient.post(ENDPOINTS.conversations.list, { participantId });
  return mapConversation(data);
}

export async function fetchMessages(conversationId, { page = 0, size = MESSAGE_PAGE_SIZE, signal } = {}) {
  const { data } = await apiClient.get(ENDPOINTS.conversations.messages(conversationId), { params: { page, size }, signal });
  const result = normalizePage(data, size);
  return { ...result, items: result.items.map(mapMessage) };
}

export async function sendMessage(conversationId, { text, replyToId, attachmentIds }) {
  const body = { content: text };
  if (replyToId) body.replyToId = replyToId;
  if (attachmentIds?.length) body.attachmentIds = attachmentIds;
  const { data } = await apiClient.post(ENDPOINTS.conversations.messages(conversationId), body);
  return mapMessage(data);
}

export async function uploadAttachment(file, { onProgress, signal } = {}) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post(ENDPOINTS.messages.attachments, form, {
    signal,
    timeout: 0,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
  });
  return mapAttachment(data);
}

export const markConversationRead = (id) => apiClient.post(ENDPOINTS.conversations.read(id));
export const setPinned = (id, pinned) => (pinned ? apiClient.put(ENDPOINTS.conversations.pin(id)) : apiClient.delete(ENDPOINTS.conversations.pin(id)));
export const setArchived = (id, archived) => (archived ? apiClient.put(ENDPOINTS.conversations.archive(id)) : apiClient.delete(ENDPOINTS.conversations.archive(id)));
export const addReaction = (messageId, emoji) => apiClient.post(ENDPOINTS.messages.reactions(messageId), { emoji });
export const removeReaction = (messageId, emoji) => apiClient.delete(ENDPOINTS.messages.reactions(messageId), { params: { emoji } });

export async function fetchProfile(userId, { signal } = {}) {
  const { data } = await apiClient.get(ENDPOINTS.users.profile(userId), { signal });
  return mapUser(data);
}
