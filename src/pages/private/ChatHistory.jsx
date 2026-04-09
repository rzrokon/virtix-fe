import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, DatePicker, Empty, Input, Spin, Tag, message as antdMessage } from 'antd';
import { ArrowLeftOutlined, ExportOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { getData } from '../../scripts/api-service';

const { RangePicker } = DatePicker;

const getConversationId = (item) => item?.id ?? item?.conversation ?? item?.conversation_id ?? null;

const formatDateTime = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const sanitizeAudio = (url) => {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/[`\s]/g, '');
};

const mapConversationMeta = (item) => ({
  id: getConversationId(item),
  title: item?.conversation_title || item?.title || `Conversation #${getConversationId(item) ?? 'Unknown'}`,
  customerId: item?.customer ?? item?.customer_id ?? null,
  customerLabel: item?.customer_email || item?.email || `Customer ${item?.customer ?? item?.customer_id ?? 'Unknown'}`,
  updatedAt: item?.date || item?.updated_at || item?.created_at || item?.timestamp || null,
});

const mapMessageRows = (item, conversationId) => {
  const when = item?.date || item?.created_at || item?.timestamp || null;
  const senderType = String(item?.sender_type || '').toUpperCase();
  const userText = item?.user_query ?? item?.prompt ?? '';
  const botText = item?.response ?? item?.message ?? '';
  const queryAudio = sanitizeAudio(item?.query_audio);
  const responseAudio = sanitizeAudio(item?.response_audio);
  const baseId = item?.id ?? `${conversationId}-${when ?? Math.random()}`;

  if (senderType === 'CUSTOMER' && !botText) {
    return [{
      id: `${baseId}-u`,
      text: userText,
      isBot: false,
      time: formatDateTime(when),
      audioUrl: queryAudio || undefined,
    }].filter((msg) => msg.text || msg.audioUrl);
  }

  if (senderType === 'BOT' && !userText) {
    return [{
      id: `${baseId}-b`,
      text: botText,
      isBot: true,
      time: formatDateTime(when),
      audioUrl: responseAudio || undefined,
    }].filter((msg) => msg.text || msg.audioUrl);
  }

  return [
    {
      id: `${baseId}-u`,
      text: userText,
      isBot: false,
      time: formatDateTime(when),
      audioUrl: queryAudio || undefined,
    },
    {
      id: `${baseId}-b`,
      text: botText,
      isBot: true,
      time: formatDateTime(when),
      audioUrl: responseAudio || undefined,
    },
  ].filter((msg) => msg.text || msg.audioUrl);
};

const escapeCsvValue = (value) => {
  const normalized = value == null ? '' : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

const downloadCsv = (filename, rows) => {
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function ChatHistory() {
  const { id, customerId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    date_after: '',
    date_before: '',
  });

  const selectedConversationId = selectedConversation?.id || null;

  const visibleMessages = useMemo(() => messages.flatMap((item) => mapMessageRows(item, selectedConversationId)), [messages, selectedConversationId]);

  const fetchMessages = async (conversation, currentFilters = filters) => {
    const conversationId = getConversationId(conversation);
    if (!id || !conversationId) {
      setMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);
      const params = new URLSearchParams();
      params.set('agent', id);
      params.set('conversation', conversationId);
      params.set('ordering', '-date');

      const resolvedCustomerId = conversation?.customerId || conversation?.customer || conversation?.customer_id || customerId;
      if (resolvedCustomerId) params.set('customer', resolvedCustomerId);
      if (currentFilters.search) params.set('search', currentFilters.search);
      if (currentFilters.date_after) params.set('date_after', currentFilters.date_after);
      if (currentFilters.date_before) params.set('date_before', currentFilters.date_before);

      const res = await getData(`api/agent/messages/?${params.toString()}`);
      const rows = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setMessages(rows);
    } catch (error) {
      console.error('Error fetching messages:', error);
      antdMessage.error('Failed to load messages');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchConversations = async () => {
    if (!id) return;

    try {
      setLoadingConversations(true);
      const params = new URLSearchParams();
      params.set('agent', id);
      params.set('ordering', '-date');
      if (customerId) params.set('customer', customerId);

      const res = await getData(`api/agent/conversations/?${params.toString()}`);
      const rows = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      const mapped = rows.map(mapConversationMeta).filter((item) => item.id);
      setConversations(mapped);

      let nextSelected = null;
      if (selectedConversationId) {
        nextSelected = mapped.find((item) => String(item.id) === String(selectedConversationId)) || null;
      }
      if (!nextSelected) {
        nextSelected = mapped[0] || null;
      }

      setSelectedConversation(nextSelected);
      if (nextSelected) {
        await fetchMessages(nextSelected, filters);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      antdMessage.error('Failed to load conversations');
      setConversations([]);
      setMessages([]);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    setSelectedConversation(null);
    setMessages([]);
  }, [customerId]);

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, customerId]);

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation);
  };

  const applyFilters = async () => {
    await fetchMessages(selectedConversation, filters);
  };

  const resetFilters = async () => {
    const next = { search: '', date_after: '', date_before: '' };
    setFilters(next);
    await fetchMessages(selectedConversation, next);
  };

  const exportConversation = () => {
    if (!selectedConversation || visibleMessages.length === 0) {
      antdMessage.warning('No conversation messages available to export');
      return;
    }

    const headers = ['conversation_id', 'customer', 'title', 'sender', 'timestamp', 'message', 'audio_url'];
    const rows = [headers.join(',')];

    visibleMessages.forEach((item) => {
      rows.push(
        [
          selectedConversation.id,
          selectedConversation.customerId ?? '',
          selectedConversation.title ?? '',
          item.isBot ? 'BOT' : 'CUSTOMER',
          item.time ?? '',
          item.text ?? '',
          item.audioUrl ?? '',
        ].map(escapeCsvValue).join(',')
      );
    });

    const safeConversationId = String(selectedConversation.id).replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadCsv(`chat_history_${safeConversationId}.csv`, rows);
    antdMessage.success('Chat history exported successfully');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          <Tag color="blue">{conversations.length}</Tag>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex items-center justify-center h-full"><Spin /></div>
          ) : conversations.length === 0 ? (
            <div className="h-full flex items-center justify-center p-6">
              <Empty description="No conversations found" />
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  String(selectedConversationId) === String(conversation.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar size={40} className="flex-shrink-0">
                    {String(conversation.title || 'C').charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{conversation.title}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(conversation.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{conversation.customerLabel}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  className="text-gray-600"
                  onClick={() => window.history.back()}
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {selectedConversation?.title || 'Chat History'}
                  </h1>
                  <p className="text-sm text-gray-500 mb-0">
                    {selectedConversation?.customerLabel || (customerId ? `Customer ${customerId}` : 'All customers')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="default" icon={<ReloadOutlined />} onClick={fetchConversations}>
                  Refresh
                </Button>
                <Button
                  type="default"
                  icon={<ExportOutlined />}
                  onClick={exportConversation}
                  disabled={!selectedConversation || visibleMessages.length === 0}
                >
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                allowClear
                value={filters.search}
                prefix={<SearchOutlined />}
                placeholder="Search selected conversation"
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                onPressEnter={applyFilters}
              />

              <RangePicker
                className="w-full"
                value={filters.date_after && filters.date_before ? [dayjs(filters.date_after), dayjs(filters.date_before)] : null}
                onChange={(_, dateStrings) =>
                  setFilters((prev) => ({
                    ...prev,
                    date_after: dateStrings[0] || '',
                    date_before: dateStrings[1] || '',
                  }))
                }
              />

              <div className="flex gap-2">
                <Button type="primary" onClick={applyFilters} disabled={!selectedConversationId}>
                  Apply
                </Button>
                <Button onClick={resetFilters} disabled={!selectedConversationId}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full"><Spin /></div>
          ) : !selectedConversation ? (
            <div className="h-full flex items-center justify-center">
              <Empty description="Select a conversation" />
            </div>
          ) : visibleMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <Empty description="No messages to display" />
            </div>
          ) : (
            visibleMessages.map((item) => (
              <div key={item.id} className={`flex ${item.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-xs lg:max-w-md">
                  <div className={`${item.isBot ? 'bg-gray-100 text-gray-800' : 'bg-black text-white'} rounded-2xl px-4 py-2`}>
                    {item.text && <p className="text-sm whitespace-pre-wrap">{item.text}</p>}
                    {item.audioUrl && (
                      <audio controls className="mt-2 w-64">
                        <source src={item.audioUrl} />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${item.isBot ? 'text-left' : 'text-right'}`}>
                    {item.time}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
