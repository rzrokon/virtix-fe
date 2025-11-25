
import React, { useState, useEffect } from 'react';
import { Button, Avatar, Spin, message as antdMessage } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined, FilterOutlined, ExportOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { getData } from '../../scripts/api-service';

export default function ChatHistory() {
  const { id, customerId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await getData(`api/agent/conversations/?agent=${id}&customer=${customerId}`);
      const items = res?.results || res || [];
      setConversations(items);
      if (items.length === 0) {
        antdMessage.info('No conversations found');
        setMessages([]);
      } else {
        const idx = Math.min(selectedConversation, items.length - 1);
        await fetchMessages(items[idx]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      antdMessage.error('Failed to load conversations');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sanitizeAudio = (url) => {
    if (!url || typeof url !== 'string') return '';
    return url.replace(/[`\s]/g, '');
  };

  const toChatMessages = (item) => {
    const when = item?.date || item?.created_at || item?.timestamp || null;
    const time = when ? new Date(when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const userText = item?.user_query ?? item?.prompt ?? '';
    const botText = item?.response ?? '';
    const queryAudio = sanitizeAudio(item?.query_audio);
    const responseAudio = sanitizeAudio(item?.response_audio);

    const userMsg = {
      id: `${item?.id ?? Math.random()}-u`,
      text: userText,
      isBot: false,
      time,
      audioUrl: queryAudio || undefined,
    };
    const botMsg = {
      id: `${item?.id ?? Math.random()}-b`,
      text: botText,
      isBot: true,
      time,
      audioUrl: responseAudio || undefined,
    };
    // Only include messages that have at least text or audio
    return [userMsg, botMsg].filter((m) => (m.text && m.text.length) || m.audioUrl);
  };

  const fetchMessages = async (conversation) => {
    if (!conversation) {
      setMessages([]);
      return;
    }
    try {
      setMessagesLoading(true);
      const convId = conversation.id ?? conversation.conversation; // prefer numeric id
      if (!convId) {
        setMessages([]);
        return;
      }
      const url = `api/agent/messages/?agent=${id}&customer=${customerId}&conversation=${convId}&ordering=-date`;
      const res = await getData(url);
      const list = res?.results || res || [];
      const mapped = Array.isArray(list) ? list.flatMap((m) => toChatMessages(m)) : [];
      setMessages(mapped);
    } catch (error) {
      console.error('Error fetching messages:', error);
      antdMessage.error('Failed to load messages');
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (id && customerId) {
      fetchConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, customerId]);

  useEffect(() => {
    const selected = conversations && conversations.length > 0 ? conversations[selectedConversation] : null;
    if (selected) {
      fetchMessages(selected);
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  const selected = conversations && conversations.length > 0 ? conversations[selectedConversation] : null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversation List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Spin /></div>
          ) : (
            conversations.map((conversation, index) => (
              <div
                key={conversation.id || conversation.conversation_id || index}
                onClick={() => setSelectedConversation(index)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === index ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar size={40} className="flex-shrink-0">
                    {String(conversation.conversation_title || 'C').charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.conversation_title || `Conversation #${conversation.id ?? index + 1}`}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2">
                        {conversation.date ? new Date(conversation.date).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conversation.conversation_id ? `ID: ${conversation.conversation_id}` : `Agent: ${conversation.agent_name || id}`}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                className="text-gray-600"
                onClick={() => window.history.back()}
              />
              <h1 className="text-xl font-semibold text-gray-900">
                {selected ? (selected.conversation_title || `Conversation #${selected.id}`) : `Customer ${customerId}`}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                type="default" 
                icon={<ReloadOutlined />}
                className="text-gray-600"
                onClick={fetchConversations}
              >
                Refresh
              </Button>
              <Button 
                type="default" 
                icon={<FilterOutlined />}
                className="text-gray-600"
                disabled
              >
                Filter
              </Button>
              <Button 
                type="default" 
                icon={<ExportOutlined />}
                className="text-gray-600"
                disabled
              >
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full"><Spin /></div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages to display</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-xs lg:max-w-md">
                  {m.isBot ? (
                    <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-2">
                      {m.text && <p className="text-sm whitespace-pre-wrap">{m.text}</p>}
                      {m.audioUrl && (
                        <audio controls className="mt-2 w-64">
                          <source src={m.audioUrl} />
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </div>
                  ) : (
                    <div className="bg-black text-white rounded-2xl px-4 py-2">
                      {m.text && <p className="text-sm whitespace-pre-wrap">{m.text}</p>}
                      {m.audioUrl && (
                        <audio controls className="mt-2 w-64">
                          <source src={m.audioUrl} />
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </div>
                  )}
                  <div className={`text-xs text-gray-500 mt-1 ${m.isBot ? 'text-left' : 'text-right'}`}>
                    {m.time}
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
