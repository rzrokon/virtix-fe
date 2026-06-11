import { useEffect, useState } from "react";
import { Button, Card, Empty, Select, Spin, Statistic, Tag, Typography } from "antd";
import { CheckCircle, Clock, MessageSquare, Plus, RefreshCw, TicketCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { getData } from "../../scripts/api-service";
import { SUPPORT_TICKETS } from "../../scripts/api";
import SubmitTicketModal from "../../components/support/SubmitTicketModal";

const { Text } = Typography;

const STATUS_COLOR = {
  open: "blue",
  in_progress: "orange",
  waiting: "purple",
  resolved: "green",
  closed: "default",
};

const PRIORITY_COLOR = {
  low: "default",
  normal: "blue",
  high: "orange",
  urgent: "red",
};

const PRIORITY_DOT = {
  low: "bg-gray-400",
  normal: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

function fmt(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getData(SUPPORT_TICKETS);
      setTickets(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = statusFilter ? tickets.filter((t) => t.status === statusFilter) : tickets;

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => ["resolved", "closed"].includes(t.status)).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TicketCheck size={22} className="text-[#6200FF]" />
            My Support Tickets
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all your support requests in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={<RefreshCw size={14} />} onClick={load} />
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setShowSubmit(true)}>
            New Ticket
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center" styles={{ body: { padding: "16px" } }}>
          <Statistic
            title={<span className="text-xs text-gray-500">Total</span>}
            value={stats.total}
            prefix={<TicketCheck size={14} className="text-gray-400 mr-1" />}
          />
        </Card>
        <Card
          className="text-center cursor-pointer hover:border-blue-400 transition-colors"
          styles={{ body: { padding: "16px" } }}
          onClick={() => setStatusFilter(statusFilter === "open" ? "" : "open")}
        >
          <Statistic
            title={<span className="text-xs text-blue-500">Open</span>}
            value={stats.open}
            valueStyle={{ color: "#3b82f6" }}
            prefix={<MessageSquare size={14} className="text-blue-400 mr-1" />}
          />
        </Card>
        <Card
          className="text-center cursor-pointer hover:border-orange-400 transition-colors"
          styles={{ body: { padding: "16px" } }}
          onClick={() => setStatusFilter(statusFilter === "in_progress" ? "" : "in_progress")}
        >
          <Statistic
            title={<span className="text-xs text-orange-500">In Progress</span>}
            value={stats.in_progress}
            valueStyle={{ color: "#f97316" }}
            prefix={<Clock size={14} className="text-orange-400 mr-1" />}
          />
        </Card>
        <Card
          className="text-center cursor-pointer hover:border-green-400 transition-colors"
          styles={{ body: { padding: "16px" } }}
          onClick={() => setStatusFilter(statusFilter === "resolved" ? "" : "resolved")}
        >
          <Statistic
            title={<span className="text-xs text-green-500">Resolved</span>}
            value={stats.resolved}
            valueStyle={{ color: "#22c55e" }}
            prefix={<CheckCircle size={14} className="text-green-400 mr-1" />}
          />
        </Card>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Text className="text-sm text-gray-500 font-medium">Filter:</Text>
        {[
          { label: "All", value: "" },
          { label: "Open", value: "open" },
          { label: "In Progress", value: "in_progress" },
          { label: "Waiting on Me", value: "waiting" },
          { label: "Resolved", value: "resolved" },
          { label: "Closed", value: "closed" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              statusFilter === opt.value
                ? "bg-[#6200FF] text-white border-[#6200FF]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#6200FF]/50 hover:text-[#6200FF]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="flex justify-center py-20"><Spin size="large" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <Empty description={statusFilter ? `No ${statusFilter.replace("_", " ")} tickets.` : "No tickets yet."} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={() => setShowSubmit(true)}>Submit your first ticket</Button>
          </Empty>
        </Card>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_140px_110px_110px_110px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</Text>
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</Text>
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</Text>
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</Text>
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Date</Text>
          </div>

          {filtered.map((ticket, i) => (
            <Link key={ticket.id} to={`/my-tickets/${ticket.id}`} className="block">
              <div
                className={`grid grid-cols-1 md:grid-cols-[1fr_140px_110px_110px_110px] gap-3 md:gap-4 items-center px-5 py-4 hover:bg-[#6200FF]/[0.03] transition-colors ${
                  i < filtered.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {/* Subject + ticket number */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[ticket.priority] || "bg-gray-400"}`}
                    />
                    <span className="font-semibold text-gray-900 truncate text-sm">{ticket.subject}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-400 ml-4">{ticket.ticket_number}</span>
                </div>

                {/* Department */}
                <div>
                  <span className="text-xs text-gray-500 md:block hidden">{ticket.department_display}</span>
                  {/* Mobile: show inline */}
                  <span className="text-xs text-gray-500 md:hidden">
                    {ticket.department_display} ·{" "}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <Tag color={STATUS_COLOR[ticket.status] || "default"} className="text-xs">
                    {ticket.status_display}
                  </Tag>
                </div>

                {/* Priority */}
                <div>
                  <Tag color={PRIORITY_COLOR[ticket.priority] || "default"} className="text-xs">
                    {ticket.priority_display}
                  </Tag>
                </div>

                {/* Date + reply count */}
                <div className="text-right">
                  <p className="text-xs text-gray-400">{fmt(ticket.created_at)}</p>
                  {ticket.reply_count > 0 && (
                    <p className="text-xs text-[#6200FF] mt-0.5">
                      {ticket.reply_count} {ticket.reply_count === 1 ? "reply" : "replies"}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <SubmitTicketModal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        onSuccess={() => { setShowSubmit(false); load(); }}
      />
    </div>
  );
}
