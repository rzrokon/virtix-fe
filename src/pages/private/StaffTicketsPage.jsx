import { useEffect, useRef, useState } from "react";
import {
  Badge, Button, Card, Empty, Input, Select, Spin, Tag, Typography, message, Modal,
} from "antd";
import { MessageSquare, RefreshCw, Send, User } from "lucide-react";
import { getData, patchData, postData } from "../../scripts/api-service";
import {
  STAFF_TICKETS, STAFF_TICKET_DETAIL, STAFF_TICKET_UPDATE,
  STAFF_TICKET_REPLY, STAFF_MEMBERS,
} from "../../scripts/api";

const { Text } = Typography;
const { TextArea } = Input;

const STATUS_COLOR = {
  open: "blue",
  in_progress: "orange",
  waiting: "purple",
  resolved: "green",
  closed: "default",
};
const PRIORITY_COLOR = { low: "default", normal: "blue", high: "orange", urgent: "red" };

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Waiting on Customer", value: "waiting" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];
const PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "" },
  { label: "Low", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];
const DEPT_OPTIONS = [
  { label: "All Departments", value: "" },
  { label: "Billing & Payments", value: "billing" },
  { label: "Technical Support", value: "technical" },
  { label: "General Inquiry", value: "general" },
  { label: "Sales", value: "sales" },
  { label: "Feature Request", value: "feature" },
  { label: "Other", value: "other" },
];

function fmt(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function StaffTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [filters, setFilters] = useState({ status: "open", department: "", priority: "" });
  const bottomRef = useRef(null);

  const loadList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.department) params.set("department", filters.department);
      if (filters.priority) params.set("priority", filters.priority);
      const data = await getData(`${STAFF_TICKETS}?${params}`);
      setTickets(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const data = await getData(STAFF_TICKET_DETAIL(id));
      setSelected(data);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadStaff = async () => {
    try {
      const data = await getData(STAFF_MEMBERS);
      setStaffList(Array.isArray(data) ? data : []);
    } catch { /* non-critical */ }
  };

  useEffect(() => { loadList(); }, [filters]);
  useEffect(() => { loadStaff(); }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.replies]);

  const handleSelectTicket = (ticket) => {
    loadDetail(ticket.id);
    setReply("");
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await postData(STAFF_TICKET_REPLY(selected.id), { message: reply.trim() });
      message.success("Reply sent.");
      setReply("");
      loadDetail(selected.id);
      loadList();
    } catch {
      message.error("Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selected) return;
    try {
      const res = await patchData(STAFF_TICKET_UPDATE(selected.id), { status: newStatus });
      if (res?.error) throw new Error();
      message.success("Status updated.");
      setSelected(res);
      loadList();
    } catch {
      message.error("Failed to update status.");
    }
  };

  const handleAssign = async (staffId) => {
    if (!selected) return;
    try {
      const res = await patchData(STAFF_TICKET_UPDATE(selected.id), { assigned_to: staffId || null });
      if (res?.error) throw new Error();
      message.success("Assigned.");
      setSelected(res);
      loadList();
    } catch {
      message.error("Failed to assign.");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={20} className="text-[#6200FF]" />
            Support Tickets
          </h1>
          <Text className="text-gray-500 text-sm">Manage and reply to customer support tickets.</Text>
        </div>
        <Button icon={<RefreshCw size={14} />} onClick={loadList}>Refresh</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Select
          style={{ width: 160 }}
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          options={STATUS_OPTIONS}
        />
        <Select
          style={{ width: 170 }}
          value={filters.department}
          onChange={(v) => setFilters((f) => ({ ...f, department: v }))}
          options={DEPT_OPTIONS}
        />
        <Select
          style={{ width: 150 }}
          value={filters.priority}
          onChange={(v) => setFilters((f) => ({ ...f, priority: v }))}
          options={PRIORITY_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Ticket list */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-[78vh] overflow-hidden flex flex-col" styles={{ body: { padding: 0, height: "100%", display: "flex", flexDirection: "column" } }}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <Text strong>Tickets</Text>
              <Tag color="purple">{tickets.length}</Tag>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-10"><Spin /></div>
              ) : tickets.length === 0 ? (
                <Empty description="No tickets" className="mt-8" />
              ) : (
                tickets.map((t) => {
                  const active = selected?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTicket(t)}
                      className={`cursor-pointer px-4 py-3 border-b transition-colors ${
                        active ? "bg-purple-50 border-l-4 border-l-[#6200FF]" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Text className="text-xs font-mono text-gray-400">{t.ticket_number}</Text>
                          <p className="font-medium text-gray-900 text-sm truncate">{t.subject}</p>
                          <p className="text-xs text-gray-500 truncate">{t.customer_email}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <Tag color={STATUS_COLOR[t.status]}>{t.status_display}</Tag>
                          <Badge count={t.reply_count} color="#6200FF" size="small" />
                        </div>
                      </div>
                      <div className="mt-1 flex gap-1 flex-wrap">
                        <Tag color={PRIORITY_COLOR[t.priority]} className="text-xs">{t.priority_display}</Tag>
                        <Tag className="text-xs">{t.department_display}</Tag>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right: Ticket detail */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="h-[78vh] flex flex-col" styles={{ body: { padding: 0, height: "100%", display: "flex", flexDirection: "column" } }}>
            {!selected ? (
              <div className="flex-1 flex items-center justify-center">
                <Empty description="Select a ticket to view" />
              </div>
            ) : loadingDetail ? (
              <div className="flex-1 flex items-center justify-center"><Spin /></div>
            ) : (
              <>
                {/* Ticket header */}
                <div className="px-5 py-4 border-b space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Text className="text-xs font-mono text-gray-400">{selected.ticket_number}</Text>
                      <h2 className="font-bold text-gray-900">{selected.subject}</h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Tag color={STATUS_COLOR[selected.status]}>{selected.status_display}</Tag>
                        <Tag color={PRIORITY_COLOR[selected.priority]}>{selected.priority_display}</Tag>
                        <Tag>{selected.department_display}</Tag>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        {selected.customer_name || selected.customer_email}
                      </div>
                      <div>{selected.customer_email}</div>
                      <div className="mt-1">{fmt(selected.created_at)}</div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      <Text className="text-xs text-gray-500">Status:</Text>
                      <Select
                        size="small"
                        style={{ width: 160 }}
                        value={selected.status}
                        onChange={handleStatusChange}
                        options={STATUS_OPTIONS.filter((o) => o.value)}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Text className="text-xs text-gray-500">Assign to:</Text>
                      <Select
                        size="small"
                        style={{ width: 160 }}
                        value={selected.assigned_to || null}
                        onChange={handleAssign}
                        allowClear
                        placeholder="Unassigned"
                        options={staffList.map((s) => ({ label: s.name, value: s.id }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Message thread */}
                <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4 space-y-4">
                  {/* Original description */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <Text className="text-xs text-gray-400 block mb-1">
                        {selected.customer_name || selected.customer_email} · {fmt(selected.created_at)}
                      </Text>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.description}</p>
                    </div>
                  </div>

                  {(selected.replies || []).map((r) => (
                    <div key={r.id} className={`flex ${r.is_staff_reply ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          r.is_staff_reply ? "bg-[#6200FF] text-white" : "bg-white border border-gray-200"
                        }`}
                      >
                        <Text className={`text-xs block mb-1 ${r.is_staff_reply ? "text-white/70" : "text-gray-400"}`}>
                          {r.is_staff_reply ? `Staff — ${r.author_display}` : r.author_display} · {fmt(r.created_at)}
                        </Text>
                        <p className={`text-sm whitespace-pre-wrap ${r.is_staff_reply ? "text-white" : "text-gray-800"}`}>
                          {r.message}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Reply box */}
                {selected.status === "closed" ? (
                  <div className="px-5 py-3 border-t bg-gray-50">
                    <Text className="text-sm text-gray-500">This ticket is closed.</Text>
                  </div>
                ) : (
                  <div className="px-5 py-4 border-t">
                    <TextArea
                      rows={3}
                      placeholder="Type your reply to the customer…"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSendReply();
                      }}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        size="small"
                        onClick={() => handleStatusChange("resolved")}
                      >
                        Mark Resolved
                      </Button>
                      <Button
                        type="primary"
                        size="small"
                        icon={<Send size={12} />}
                        loading={sending}
                        disabled={!reply.trim()}
                        onClick={handleSendReply}
                      >
                        Send Reply
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
