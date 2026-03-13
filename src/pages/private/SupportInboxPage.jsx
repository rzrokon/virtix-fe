import {
  Button,
  Card,
  Empty,
  Input,
  List,
  Select,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getData, postData } from "../../scripts/api-service";
import { handleApiError } from "../../scripts/helper";

const { Title, Text } = Typography;
const { TextArea } = Input;

function getStatusColor(status) {
  switch (status) {
    case "REQUESTED":
      return "orange";
    case "ACTIVE":
      return "blue";
    case "CLOSED":
      return "default";
    case "BOT":
      return "green";
    default:
      return "default";
  }
}

function formatTime(dt) {
  if (!dt) return "";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

function renderMessageText(msg) {
  if (msg.sender_type === "CUSTOMER") return msg.user_query || "";
  return msg.response || "";
}

export default function SupportInboxPage() {
  const { id } = useParams();

  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const [statusFilter, setStatusFilter] = useState("REQUESTED");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesList, setMessagesList] = useState([]);
  const [replyText, setReplyText] = useState("");

  const pollRef = useRef(null);

  const selectedConversationId = selectedConversation?.conversation_id || null;

  const selectedStatus = useMemo(() => {
    return selectedConversation?.handover_status || "";
  }, [selectedConversation]);

  // ✅ no leading slash
  const conversationsApi = `api/agent/support/agent/${id}/handover/conversations/?status=${statusFilter}`;
  const messagesApi = (conversationId) =>
    `api/agent/support/conversations/${conversationId}/messages/`;
  const acceptApi = (conversationId) =>
    `api/agent/support/conversations/${conversationId}/accept/`;
  const replyApi = (conversationId) =>
    `api/agent/support/conversations/${conversationId}/reply/`;
  const closeApi = (conversationId) =>
    `api/agent/support/conversations/${conversationId}/close/`;

  const loadConversations = async (preserveSelection = true) => {
    setLoadingConversations(true);
    try {
      const response = await getData(conversationsApi);
      const rows = response?.results || response || [];
      setConversations(rows);

      if (preserveSelection && selectedConversationId) {
        const found = rows.find((item) => item.conversation_id === selectedConversationId);
        if (found) setSelectedConversation(found);
      }
    } catch (error) {
      console.error("loadConversations error:", error);
      message.error(handleApiError(error) || "Failed to load support conversations.");
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    setLoadingMessages(true);
    try {
      const response = await getData(messagesApi(conversationId));
      const rows = response?.results || response || [];
      setMessagesList(rows);
    } catch (error) {
      console.error("loadMessages error:", error);
      message.error(handleApiError(error) || "Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const onSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.conversation_id);
  };

  const onAcceptConversation = async () => {
    if (!selectedConversationId) return;

    try {
      const res = await postData(acceptApi(selectedConversationId), {});
      if (res?.error) {
        message.error("Failed to accept conversation.");
        return;
      }

      message.success("Conversation accepted.");

      // move to active list after accept
      setStatusFilter("ACTIVE");
      await loadMessages(selectedConversationId);
    } catch (error) {
      console.error("accept error:", error);
      message.error(handleApiError(error) || "Failed to accept conversation.");
    }
  };

  const onSendReply = async () => {
    if (!selectedConversationId) return;
    if (!replyText.trim()) {
      message.warning("Please type a reply.");
      return;
    }

    setSendingReply(true);
    try {
      const res = await postData(replyApi(selectedConversationId), {
        message: replyText.trim(),
      });

      if (res?.error) {
        message.error("Failed to send reply.");
        return;
      }

      setReplyText("");
      message.success("Reply sent.");
      await loadMessages(selectedConversationId);
      await loadConversations(false);
    } catch (error) {
      console.error("reply error:", error);
      message.error(handleApiError(error) || "Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  const onCloseConversation = async () => {
    if (!selectedConversationId) return;
    try {
      const res = await postData(closeApi(selectedConversationId), {});
      if (res?.error) {
        message.error("Failed to close handover.");
        return;
      }

      message.success("Handover closed.");
      await loadMessages(selectedConversationId);
      await loadConversations(false);
    } catch (error) {
      console.error("close error:", error);
      message.error(handleApiError(error) || "Failed to close handover.");
    }
  };

  useEffect(() => {
    if (!id) return;
    loadConversations(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, statusFilter]);

  useEffect(() => {
    if (!selectedConversationId) return;

    pollRef.current = setInterval(() => {
      loadMessages(selectedConversationId);
      loadConversations(true);
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId, statusFilter]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <Title level={3} className="!mb-1">
            Human Handover Inbox
          </Title>
          <Text className="text-gray-500">
            View and manage conversations that require human support.
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Text className="text-sm text-gray-500">Status</Text>
          <Select
            style={{ width: 160 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "Requested", value: "REQUESTED" },
              { label: "Active", value: "ACTIVE" },
              { label: "Closed", value: "CLOSED" },
            ]}
          />
          <Button onClick={() => loadConversations(true)}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left panel */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="rounded-2xl shadow-sm h-[75vh]">
            <div className="flex items-center justify-between mb-4">
              <Title level={5} className="!mb-0">
                Conversations
              </Title>
              <Tag color="purple">{conversations.length}</Tag>
            </div>

            <div className="h-[65vh] overflow-y-auto pr-1">
              {loadingConversations ? (
                <div className="h-full flex items-center justify-center p-5">
                  <Spin />
                </div>
              ) : conversations.length === 0 ? (
                <Empty description="No handover conversations" />
              ) : (
                <List
                  dataSource={conversations}
                  renderItem={(item) => {
                    const active = selectedConversationId === item.conversation_id;

                    return (
                      <List.Item
                        className={`cursor-pointer rounded-xl mb-2 px-3 py-3 border transition-all ${
                          active
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:bg-gray-50 hover:border-purple-300"
                        }`}
                        onClick={() => onSelectConversation(item)}
                      >
                        <div className="w-full">
                          <div className="flex justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate">
                                {item.customer_name || item.customer_email || "Customer"}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {item.customer_email}
                              </div>
                            </div>
                            <Tag color={getStatusColor(item.handover_status)}>
                              {item.handover_status}
                            </Tag>
                          </div>

                          <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                            {item.handover_reason || "No reason"}
                          </div>

                          <div className="mt-2 text-[11px] text-gray-400">
                            {formatTime(item.last_message_at || item.date)}
                          </div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Right panel */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="rounded-2xl shadow-sm h-[75vh] flex flex-col">
            {!selectedConversation ? (
              <div className="h-[68vh] flex items-center justify-center">
                <Empty description="Select a conversation" />
              </div>
            ) : (
              <>
                <div className="border-b pb-3 mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <Title level={5} className="!mb-1">
                      {selectedConversation.customer_name || selectedConversation.customer_email}
                    </Title>
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag color={getStatusColor(selectedConversation.handover_status)}>
                        {selectedConversation.handover_status}
                      </Tag>
                      <Text className="text-xs text-gray-500">
                        {selectedConversation.customer_email}
                      </Text>
                      {selectedConversation.assigned_to_email && (
                        <Text className="text-xs text-gray-500">
                          Assigned to: {selectedConversation.assigned_to_email}
                        </Text>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {selectedStatus === "REQUESTED" && (
                      <Button
                        type="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcceptConversation();
                        }}
                      >
                        Accept
                      </Button>
                    )}
                    {(selectedStatus === "REQUESTED" || selectedStatus === "ACTIVE") && (
                      <Button
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseConversation();
                        }}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>

                {selectedConversation.handover_reason && (
                  <div className="mb-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
                    <Text className="text-sm text-amber-800">
                      <strong>Reason:</strong> {selectedConversation.handover_reason}
                    </Text>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto border rounded-xl bg-gray-50 p-3">
                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <Spin />
                    </div>
                  ) : messagesList.length === 0 ? (
                    <Empty description="No messages yet" />
                  ) : (
                    <div className="space-y-3">
                      {messagesList.map((msg) => {
                        const text = renderMessageText(msg);
                        const isCustomer = msg.sender_type === "CUSTOMER";
                        const isHuman = msg.sender_type === "HUMAN";
                        const isSystem = msg.sender_type === "SYSTEM";

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                                isCustomer
                                  ? "bg-white border border-gray-200"
                                  : isHuman
                                  ? "bg-blue-600 text-white"
                                  : isSystem
                                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                                  : "bg-purple-600 text-white"
                              }`}
                            >
                              <div className="text-[11px] mb-1 opacity-80">
                                {msg.sender_type}
                                {msg.human_agent_email ? ` • ${msg.human_agent_email}` : ""}
                              </div>
                              <div className="whitespace-pre-wrap break-words">{text}</div>
                              <div className="text-[11px] mt-2 opacity-70">
                                {formatTime(msg.date)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <TextArea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your human reply here..."
                    className="rounded-xl"
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <Button onClick={() => setReplyText("")}>Clear</Button>
                    <Button type="primary" loading={sendingReply} onClick={onSendReply}>
                      Send Reply
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}