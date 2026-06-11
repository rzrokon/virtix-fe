import { useEffect, useRef, useState } from "react";
import {
  Alert, Badge, Button, Card, Divider, Empty, Input, Select, Spin, Tag, Typography, message,
} from "antd";
import { Building2, Calendar, Globe, Mail, RefreshCw, Send, User } from "lucide-react";
import { getData, patchData, postData } from "../../scripts/api-service";
import {
  STAFF_CONTACTS,
  STAFF_CONTACT_DETAIL,
  STAFF_CONTACT_REPLY,
  STAFF_CONTACT_UPDATE,
} from "../../scripts/api";

const { Text } = Typography;
const { TextArea } = Input;

const STATUS_COLOR = { new: "blue", in_progress: "orange", closed: "default" };
const STATUS_LABEL = { new: "New", in_progress: "In Progress", closed: "Closed" };

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
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm py-1">
      <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
      <span className="text-gray-400 shrink-0">{label}:</span>
      <span className="text-gray-800 font-medium break-all">{value}</span>
    </div>
  );
}

export default function StaffContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [note, setNote] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const bottomRef = useRef(null);

  const loadList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("q", search.trim());
      const data = await getData(`${STAFF_CONTACTS}?${params}`);
      setContacts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await getData(STAFF_CONTACT_DETAIL(id));
      setDetail(data);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { loadList(); }, [statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => loadList(), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (selected) loadDetail(selected);
  }, [selected]);

  useEffect(() => {
    if (detail) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }, [detail?.notes?.length]);

  const sendReply = async () => {
    if (!note.trim() || !selected) return;
    setSending(true);
    try {
      const res = await postData(STAFF_CONTACT_REPLY(selected), {
        note: note.trim(),
        send_email: sendEmail,
      });
      if (res?.error) throw new Error(res.errors?.detail || "Failed to send");
      setNote("");
      message.success(sendEmail ? "Reply sent and email delivered." : "Note saved.");
      loadDetail(selected);
      loadList();
    } catch (e) {
      message.error(e.message || "Failed to send.");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!selected) return;
    setStatusUpdating(true);
    try {
      const res = await patchData(STAFF_CONTACT_UPDATE(selected), { status: newStatus });
      if (res?.error) throw new Error("Failed to update status");
      message.success("Status updated.");
      setDetail((d) => d ? { ...d, status: newStatus, status_display: STATUS_LABEL[newStatus] } : d);
      setContacts((list) =>
        list.map((c) => c.id === selected ? { ...c, status: newStatus, status_display: STATUS_LABEL[newStatus] } : c)
      );
    } catch {
      message.error("Failed to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const stats = {
    total: contacts.length,
    new: contacts.filter((c) => c.status === "new").length,
    in_progress: contacts.filter((c) => c.status === "in_progress").length,
    closed: contacts.filter((c) => c.status === "closed").length,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <div className="px-5 py-3 border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Mail size={18} className="text-[#6200FF]" />
            Contact Submissions
          </h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <Text className="text-xs text-gray-400">Total: {stats.total}</Text>
            <Badge color="blue" text={<span className="text-xs text-blue-600">New: {stats.new}</span>} />
            <Badge color="orange" text={<span className="text-xs text-orange-500">In Progress: {stats.in_progress}</span>} />
            <Badge color="default" text={<span className="text-xs text-gray-400">Closed: {stats.closed}</span>} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input.Search
            placeholder="Search name, email, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="w-56"
            size="small"
          />
          <Button icon={<RefreshCw size={13} />} size="small" onClick={loadList} />
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-5 py-2 border-b border-gray-100 bg-white flex items-center gap-2 flex-wrap">
        {[
          { label: "All", value: "" },
          { label: "New", value: "new" },
          { label: "In Progress", value: "in_progress" },
          { label: "Closed", value: "closed" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-0.5 rounded-full text-xs font-medium border transition-all ${
              statusFilter === opt.value
                ? "bg-[#6200FF] text-white border-[#6200FF]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#6200FF]/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — contact list */}
        <div className="w-80 shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
          {loading ? (
            <div className="flex justify-center py-12"><Spin /></div>
          ) : contacts.length === 0 ? (
            <div className="py-12 px-4">
              <Empty description="No contacts found." image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-[#6200FF]/[0.03] transition-colors ${
                  selected === c.id ? "bg-[#6200FF]/[0.06] border-l-2 border-l-[#6200FF]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900 truncate">
                    {c.name || c.email}
                  </span>
                  <Tag color={STATUS_COLOR[c.status]} className="text-xs shrink-0">
                    {c.status_display}
                  </Tag>
                </div>
                {c.name && (
                  <p className="text-xs text-gray-400 truncate mb-0.5">{c.email}</p>
                )}
                {c.company && (
                  <p className="text-xs text-gray-400 truncate mb-0.5">{c.company}</p>
                )}
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{c.message}</p>
                <p className="text-xs text-gray-300 mt-1">{fmtDate(c.created_at)}</p>
              </button>
            ))
          )}
        </div>

        {/* Right — detail pane */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Mail size={36} className="mb-3 opacity-30" />
              <p className="text-sm">Select a submission to view details</p>
            </div>
          ) : detailLoading ? (
            <div className="flex justify-center py-16"><Spin size="large" /></div>
          ) : !detail ? (
            <div className="p-6"><Alert type="error" message="Failed to load contact." /></div>
          ) : (
            <div className="p-5 space-y-4 max-w-3xl">

              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">{detail.name || detail.email}</h2>
                  {detail.name && <p className="text-sm text-gray-400">{detail.email}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={detail.status}
                    size="small"
                    loading={statusUpdating}
                    onChange={updateStatus}
                    className="w-36"
                    options={[
                      { value: "new", label: "New" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "closed", label: "Closed" },
                    ]}
                  />
                </div>
              </div>

              {/* Contact info card */}
              <Card styles={{ body: { padding: "16px" } }}>
                <MetaRow icon={Mail} label="Email" value={detail.email} />
                <MetaRow icon={Building2} label="Company" value={detail.company} />
                <MetaRow icon={Globe} label="Industry" value={detail.industry} />
                <MetaRow icon={Calendar} label="Received" value={fmt(detail.created_at)} />
                {detail.page_path && (
                  <MetaRow icon={Globe} label="Page" value={detail.page_path} />
                )}
                {(detail.utm_source || detail.utm_campaign) && (
                  <MetaRow
                    icon={Globe}
                    label="UTM"
                    value={[detail.utm_source, detail.utm_medium, detail.utm_campaign]
                      .filter(Boolean).join(" / ")}
                  />
                )}
              </Card>

              {/* Original message */}
              <Card
                title={<span className="text-sm font-semibold">Original Message</span>}
                styles={{ body: { padding: "16px" } }}
              >
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {detail.message}
                </p>
              </Card>

              {/* Notes / reply thread */}
              {detail.notes?.length > 0 && (
                <Card
                  title={
                    <span className="text-sm font-semibold">
                      Replies & Notes
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        ({detail.notes.length})
                      </span>
                    </span>
                  }
                  styles={{ body: { padding: "16px" } }}
                >
                  <div className="space-y-3">
                    {detail.notes.map((n) => (
                      <div key={n.id} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#6200FF] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {(n.author_name?.[0] || "S").toUpperCase()}
                        </div>
                        <div className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3">
                          <p className="text-xs text-gray-400 mb-1">
                            {n.author_name} · {fmt(n.created_at)}
                          </p>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {n.note}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                </Card>
              )}

              {/* Reply form */}
              {detail.status !== "closed" && (
                <Card
                  title={<span className="text-sm font-semibold">Reply to Customer</span>}
                  styles={{ body: { padding: "16px" } }}
                >
                  <TextArea
                    rows={4}
                    placeholder="Write your reply… (Ctrl+Enter to send)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply();
                    }}
                    className="resize-none"
                  />
                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        className="accent-[#6200FF]"
                      />
                      <Text className="text-xs text-gray-500">
                        Send email to <strong>{detail.email}</strong>
                      </Text>
                    </label>
                    <Button
                      type="primary"
                      icon={<Send size={14} />}
                      loading={sending}
                      disabled={!note.trim()}
                      onClick={sendReply}
                    >
                      {sendEmail ? "Send Reply" : "Save Note"}
                    </Button>
                  </div>
                </Card>
              )}

              {detail.status === "closed" && (
                <Alert
                  type="info"
                  showIcon
                  message="This submission is closed."
                  description={
                    <button
                      className="text-xs text-[#6200FF] underline mt-1"
                      onClick={() => updateStatus("in_progress")}
                    >
                      Reopen to reply
                    </button>
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
