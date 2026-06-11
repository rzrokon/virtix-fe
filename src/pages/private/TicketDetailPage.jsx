import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Input, Spin, Tag, Typography, message } from "antd";
import { ArrowLeft, Building2, Calendar, Hash, Send, Tag as TagIcon, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getData, postData } from "../../scripts/api-service";
import { SUPPORT_TICKET_DETAIL, SUPPORT_TICKET_REPLY } from "../../scripts/api";

const { Text } = Typography;
const { TextArea } = Input;

const STATUS_COLOR = {
  open: "blue",
  in_progress: "orange",
  waiting: "purple",
  resolved: "green",
  closed: "default",
};

const STATUS_BG = {
  open: "bg-blue-50 border-blue-200 text-blue-700",
  in_progress: "bg-orange-50 border-orange-200 text-orange-700",
  waiting: "bg-purple-50 border-purple-200 text-purple-700",
  resolved: "bg-green-50 border-green-200 text-green-700",
  closed: "bg-gray-50 border-gray-200 text-gray-600",
};

function fmt(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDate(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <Icon size={15} className="text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const threadRef = useRef(null);

  const load = async () => {
    try {
      const data = await getData(SUPPORT_TICKET_DETAIL(ticketId));
      setTicket(data);
    } catch {
      setError("Ticket not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [ticketId]);

  useEffect(() => {
    if (ticket) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [ticket?.replies?.length]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await postData(SUPPORT_TICKET_REPLY(ticketId), { message: reply.trim() });
      if (res?.error) throw new Error(res.errors?.detail || "Failed to send");
      setReply("");
      message.success("Reply sent.");
      load();
    } catch (e) {
      message.error(e.message || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-6 max-w-xl">
        <Alert type="error" message={error || "Ticket not found."} />
        <Link to="/my-tickets" className="mt-4 inline-flex items-center gap-1 text-sm text-[#6200FF]">
          <ArrowLeft size={14} /> Back to tickets
        </Link>
      </div>
    );
  }

  const isClosed = ticket.status === "closed";
  const allMessages = [
    {
      id: "original",
      is_staff_reply: false,
      author_display: ticket.customer_name || ticket.customer_email,
      message: ticket.description,
      created_at: ticket.created_at,
      isOriginal: true,
    },
    ...(ticket.replies || []),
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Breadcrumb */}
      <Link
        to="/my-tickets"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#6200FF] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to My Tickets
      </Link>

      {/* Subject bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{ticket.subject}</h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{ticket.ticket_number}</p>
        </div>
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-semibold shrink-0 ${STATUS_BG[ticket.status] || STATUS_BG.closed}`}
        >
          {ticket.status_display}
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">

        {/* Left column — ticket metadata */}
        <div className="space-y-4">
          <Card title="Ticket Details" styles={{ header: { fontSize: 13, fontWeight: 600 }, body: { padding: "0 16px" } }}>
            <MetaRow icon={Hash} label="Ticket Number" value={ticket.ticket_number} />
            <MetaRow icon={Building2} label="Department" value={ticket.department_display} />
            <MetaRow icon={TagIcon} label="Priority" value={ticket.priority_display} />
            <MetaRow icon={Calendar} label="Opened" value={fmtDate(ticket.created_at)} />
            <MetaRow icon={Calendar} label="Last Updated" value={fmtDate(ticket.updated_at)} />
            {ticket.assigned_to && (
              <MetaRow icon={User} label="Assigned To" value="Support Team" />
            )}
          </Card>

          {isClosed && (
            <Alert
              type="info"
              showIcon
              message="Ticket Closed"
              description="Open a new ticket if you need further help."
            />
          )}

          {ticket.status === "waiting" && (
            <Alert
              type="warning"
              showIcon
              message="Waiting on Your Reply"
              description="Our team is waiting for your response to continue."
            />
          )}
        </div>

        {/* Right column — conversation thread + reply */}
        <div className="flex flex-col gap-4">

          {/* Thread */}
          <Card
            title={
              <span className="flex items-center gap-2 text-sm font-semibold">
                Conversation
                <span className="text-xs font-normal text-gray-400">
                  ({allMessages.length} {allMessages.length === 1 ? "message" : "messages"})
                </span>
              </span>
            }
          >
            <div
              ref={threadRef}
              className="space-y-4 max-h-[420px] overflow-y-auto pr-1"
            >
              {allMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.is_staff_reply ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.is_staff_reply
                        ? "bg-[#6200FF] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {msg.is_staff_reply
                      ? "S"
                      : (msg.author_display?.[0] || "?").toUpperCase()}
                  </div>

                  {/* Bubble */}
                  <div className={`flex-1 ${msg.is_staff_reply ? "items-end" : "items-start"} flex flex-col`}>
                    <div
                      className={`rounded-2xl px-4 py-3 max-w-[90%] ${
                        msg.is_staff_reply
                          ? "bg-[#6200FF] text-white self-end"
                          : msg.isOriginal
                          ? "bg-gray-50 border border-gray-200 self-start"
                          : "bg-white border border-gray-200 self-start"
                      }`}
                    >
                      <p
                        className={`text-xs mb-1 ${
                          msg.is_staff_reply ? "text-white/70 text-right" : "text-gray-400"
                        }`}
                      >
                        {msg.is_staff_reply ? "Support Team" : msg.author_display}
                        {msg.isOriginal ? " · Original message" : ""} · {fmt(msg.created_at)}
                      </p>
                      <p
                        className={`text-sm whitespace-pre-wrap leading-relaxed ${
                          msg.is_staff_reply ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </Card>

          {/* Reply box */}
          {!isClosed && (
            <Card title="Add a Reply" styles={{ header: { fontSize: 13, fontWeight: 600 } }}>
              <TextArea
                rows={4}
                placeholder="Type your reply… (Ctrl+Enter to send)"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply();
                }}
                className="resize-none"
              />
              <div className="mt-3 flex items-center justify-between">
                <Text className="text-xs text-gray-400">Ctrl+Enter to send</Text>
                <Button
                  type="primary"
                  icon={<Send size={14} />}
                  loading={sending}
                  disabled={!reply.trim()}
                  onClick={sendReply}
                >
                  Send Reply
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
