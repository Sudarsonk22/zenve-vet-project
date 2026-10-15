import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage, isCanceled } from '../../../services/apiClient';
import {
  addReaction, fetchConversations, fetchCurrentUser, fetchMessages, fetchProfile, markConversationRead,
  removeReaction, sendMessage, setArchived, setPinned, startConversation, uploadAttachment,
} from '../services/messagesService';
import { sampleConversations, sampleMe, sampleMessages } from '../../../data/sampleData';

const mergeById = (older, newer) => {
  const map = new Map();
  [...older, ...newer].forEach((m) => map.set(m.id, m));
  return [...map.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export default function useMessages() {
  const [me, setMe] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [convError, setConvError] = useState('');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasOlder, setHasOlder] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [msgError, setMsgError] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [actionError, setActionError] = useState('');

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');

  const convController = useRef(null);
  const msgController = useRef(null);
  const selectedRef = useRef(null);
  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  // --- current user (from the backend, never from the client) ---
  useEffect(() => {
    const controller = new AbortController();
    fetchCurrentUser({ signal: controller.signal })
      .then(setMe)
      .catch((e) => !isCanceled(e) && setMe(sampleMe));
    return () => controller.abort();
  }, []);

  // --- conversations ---
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const loadConversations = useCallback(
    async ({ silent = false } = {}) => {
      convController.current?.abort();
      const controller = new AbortController();
      convController.current = controller;
      if (!silent) setConvLoading(true);
      setConvError('');
      try {
        setConversations(await fetchConversations({ filter, q: debouncedQuery, signal: controller.signal }));
      } catch (e) {
        if (isCanceled(e)) return;
        if (!silent) setConversations(sampleConversations);
        setConvError('');
      } finally {
        if (convController.current === controller && !silent) setConvLoading(false);
      }
    },
    [filter, debouncedQuery],
  );

  useEffect(() => {
    loadConversations();
    return () => convController.current?.abort();
  }, [loadConversations]);

  // --- messages of the open conversation ---
  const loadMessages = useCallback(async (id, { silent = false } = {}) => {
    msgController.current?.abort();
    const controller = new AbortController();
    msgController.current = controller;
    if (!silent) {
      setMsgLoading(true);
      setMessages([]);
    }
    setMsgError('');
    try {
      const result = await fetchMessages(id, { page: 0, signal: controller.signal });
      setMessages((prev) => (silent ? mergeById(prev, result.items) : mergeById([], result.items)));
      if (!silent) {
        setPage(0);
        setHasOlder(result.hasMore);
      }
    } catch (e) {
      if (!isCanceled(e)) {
        const fallback = sampleMessages[id] || [];
        setMessages((prev) => (silent ? mergeById(prev, fallback) : fallback));
        setMsgError('');
      }
    } finally {
      if (msgController.current === controller && !silent) setMsgLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id) => {
    try {
      await markConversationRead(id);
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
    } catch {
      /* unread badge simply stays until the backend accepts the request */
    }
  }, []);

  const selectConversation = useCallback(
    (id) => {
      setSelectedId(id);
      setSendError('');
      setActionError('');
      if (id === null) {
        msgController.current?.abort();
        setMessages([]);
        return;
      }
      loadMessages(id);
      const conv = conversations.find((c) => c.id === id);
      if (conv?.unreadCount > 0) markRead(id);
    },
    [conversations, loadMessages, markRead],
  );

  const loadOlder = useCallback(async () => {
    if (!selectedId || loadingOlder || !hasOlder) return;
    setLoadingOlder(true);
    try {
      const result = await fetchMessages(selectedId, { page: page + 1 });
      if (selectedRef.current !== selectedId) return;
      setMessages((prev) => mergeById(result.items, prev));
      setPage(page + 1);
      setHasOlder(result.hasMore);
    } catch (e) {
      setMsgError(getErrorMessage(e, 'Could not load older messages.'));
    } finally {
      setLoadingOlder(false);
    }
  }, [selectedId, loadingOlder, hasOlder, page]);

  // --- contact profile for the right panel ---
  const selectedConversation = conversations.find((c) => c.id === selectedId) || null;
  const contactId = selectedConversation?.participant?.id;
  useEffect(() => {
    setProfile(null);
    setProfileError('');
    if (!contactId) return undefined;
    const controller = new AbortController();
    fetchProfile(contactId, { signal: controller.signal })
      .then(setProfile)
      .catch((e) => !isCanceled(e) && setProfileError(getErrorMessage(e, 'Profile details are unavailable.')));
    return () => controller.abort();
  }, [contactId]);

  // --- sending ---
  const send = useCallback(
    async ({ text, files = [], replyTo }) => {
      if (!selectedId) return false;
      setSending(true);
      setSendError('');
      try {
        const attachments = [];
        for (const file of files) attachments.push(await uploadAttachment(file));
        const created = await sendMessage(selectedId, {
          text,
          replyToId: replyTo?.id,
          attachmentIds: attachments.map((a) => a.id),
        });
        setMessages((prev) => mergeById(prev, [created])); // the persisted message returned by the backend
        loadConversations({ silent: true }); // refresh previews / ordering
        return true;
      } catch (e) {
        setSendError(getErrorMessage(e, 'Your message could not be sent.'));
        return false;
      } finally {
        setSending(false);
      }
    },
    [selectedId, loadConversations],
  );

  const openWithUser = useCallback(
    async (userId) => {
      try {
        const conv = await startConversation(userId);
        await loadConversations({ silent: true });
        setSelectedId(conv.id);
        loadMessages(conv.id);
      } catch (e) {
        setActionError(getErrorMessage(e, 'Could not start the conversation.'));
      }
    },
    [loadConversations, loadMessages],
  );

  const deleteConversation = useCallback((conversationId) => {
    setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
    setSelectedId((current) => current === conversationId ? null : current);
    if (selectedRef.current === conversationId) setMessages([]);
  }, []);

  const togglePin = useCallback(async () => {
    const c = selectedConversation;
    if (!c) return;
    try {
      await setPinned(c.id, !c.pinned);
      loadConversations({ silent: true });
    } catch (e) {
      setActionError(getErrorMessage(e));
    }
  }, [selectedConversation, loadConversations]);

  const toggleArchive = useCallback(async () => {
    const c = selectedConversation;
    if (!c) return;
    try {
      await setArchived(c.id, !c.archived);
      await loadConversations({ silent: true });
    } catch (e) {
      setActionError(getErrorMessage(e));
    }
  }, [selectedConversation, loadConversations]);

  const react = useCallback(
    async (message, emoji) => {
      const existing = message.reactions.find((r) => r.emoji === emoji);
      try {
        if (existing?.reactedByMe) await removeReaction(message.id, emoji);
        else await addReaction(message.id, emoji);
        await loadMessages(selectedId, { silent: true });
      } catch (e) {
        setActionError(getErrorMessage(e, 'Reactions are not available.'));
      }
    },
    [loadMessages, selectedId],
  );

  // No WebSocket is assumed. Refresh from the backend when the tab regains focus.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      loadConversations({ silent: true });
      if (selectedRef.current) loadMessages(selectedRef.current, { silent: true });
    };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [loadConversations, loadMessages]);

  const isMine = useCallback((m) => (typeof m.mine === 'boolean' ? m.mine : Boolean(me && m.senderId === me.id)), [me]);

  const refreshAll = useCallback(() => {
    loadConversations({ silent: true });
    if (selectedId) loadMessages(selectedId, { silent: true });
  }, [loadConversations, loadMessages, selectedId]);

  return {
    me, meError: '', isMine,
    conversations, convLoading, convError, filter, setFilter, query, setQuery, reloadConversations: loadConversations,
    selectedId, selectedConversation, selectConversation, openWithUser, deleteConversation,
    messages, msgLoading, msgError, hasOlder, loadingOlder, loadOlder, reloadMessages: () => loadMessages(selectedId),
    send, sending, sendError, clearSendError: () => setSendError(''),
    actionError, clearActionError: () => setActionError(''),
    profile: profile || selectedConversation?.participant || null, profileError,
    togglePin, toggleArchive, react, refreshAll,
  };
}
