import { Line } from '@ant-design/plots';
import { Card, Empty, Progress, Radio, Spin, Table } from 'antd';
import {
  CalendarRange,
  Frown,
  Meh,
  MessageSquareText,
  RefreshCw,
  Smile,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useContentApi } from '../../contexts/ContentApiContext';
import { getData } from '../../scripts/api-service';

const fmt = new Intl.NumberFormat('en-US');

const TIME_OPTIONS = [
  { label: 'Daily', value: 1 },
  { label: 'Weekly', value: 7 },
  { label: 'Monthly', value: 30 },
];

const SENTIMENT_META = {
  positive: { label: 'Positive', Icon: Smile,  color: '#16a34a', trail: '#dcfce7', bg: 'bg-green-50',  text: 'text-green-700' },
  neutral:  { label: 'Neutral',  Icon: Meh,    color: '#d97706', trail: '#fef3c7', bg: 'bg-amber-50',  text: 'text-amber-700' },
  negative: { label: 'Negative', Icon: Frown,  color: '#dc2626', trail: '#fee2e2', bg: 'bg-red-50',    text: 'text-red-700'   },
};

const FAQ_COLUMNS = [
  {
    title: '#',
    key: 'rank',
    width: 52,
    render: (_, __, i) => (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f0ebff] text-xs font-semibold text-[#6200FF]">
        {i + 1}
      </span>
    ),
  },
  {
    title: 'Question',
    dataIndex: 'prompt',
    key: 'prompt',
    render: (v) => <span className="text-sm font-medium text-slate-800">{v || 'Untitled question'}</span>,
  },
  {
    title: 'Asked',
    dataIndex: 'count',
    key: 'count',
    width: 90,
    align: 'right',
    render: (v) => (
      <span className="inline-flex items-center rounded-full bg-[#f0ebff] px-2.5 py-0.5 text-xs font-semibold text-[#6200FF]">
        {v ?? 0}
      </span>
    ),
  },
];

const getSeriesForRange = (data, days) => {
  if (!data) return [];
  if (days === 1)  return data.last_24h  || data.today   || data.daily  || data.last_7d || [];
  if (days === 30) return data.last_30d  || data.monthly || data.last_7d || [];
  return data.last_7d || data.weekly || [];
};

const formatLabel = (raw, days) => {
  if (!raw) return '-';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return days === 1
    ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const normalizeSentiments = (data) => {
  const src = data?.sentiments || data?.sentiment_breakdown || data?.sentiment || data?.totals?.sentiments || {};
  const pos = Number(src.positive ?? src.pos ?? 0);
  const neu = Number(src.neutral  ?? src.mixed ?? 0);
  const neg = Number(src.negative ?? src.neg ?? 0);
  const total = pos + neu + neg;
  return ['positive', 'neutral', 'negative'].map((key) => {
    const val = key === 'positive' ? pos : key === 'neutral' ? neu : neg;
    return { key, value: val, percent: total ? Math.round((val / total) * 100) : 0, ...SENTIMENT_META[key] };
  });
};

const StatCard = ({ label, value, note, Icon, colorClass, bgClass }) => (
  <Card className="rounded-2xl border border-slate-200 shadow-sm" styles={{ body: { padding: 20 } }}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {typeof value === 'number' ? fmt.format(value) : value}
        </p>
        <p className="mt-1.5 text-sm text-slate-500 truncate">{note}</p>
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bgClass} ${colorClass}`}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
    </div>
  </Card>
);

const ChartEmpty = () => (
  <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
    <div className="text-center">
      <CalendarRange className="mx-auto mb-3 h-8 w-8 text-slate-300" />
      <p className="text-sm text-slate-500">No data for this time range yet.</p>
    </div>
  </div>
);

const ConversationChart = ({ data, days }) => {
  if (!data?.length) return <ChartEmpty />;

  const chartData = data.map((item) => ({
    date: formatLabel(item.date || item.day || item.label, days),
    count: Number(item.count ?? item.total ?? 0),
  }));

  return (
    <Line
      data={chartData}
      xField="date"
      yField="count"
      height={260}
      smooth
      color="#6200FF"
      point={{ shapeField: 'circle', sizeField: 4, style: { fill: '#fff', stroke: '#6200FF', lineWidth: 2 } }}
      style={{ lineWidth: 2.5 }}
      axis={{
        x: { labelAutoRotate: false, tick: false, title: false },
        y: { grid: true, title: false },
      }}
      interaction={{ tooltip: { marker: false } }}
    />
  );
};

export default function AgentDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays]       = useState(7);
  const { currentAgentName }  = useContentApi();

  const fetchData = async () => {
    if (!currentAgentName) { setData(null); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await getData(`api/agent/${currentAgentName}/dashboard/?days=${days}&top=5`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [days, currentAgentName]);

  const chartData  = useMemo(() => getSeriesForRange(data, days), [data, days]);
  const sentiments = useMemo(() => normalizeSentiments(data), [data]);
  const totalSentiment = sentiments.reduce((s, i) => s + i.value, 0);

  if (!currentAgentName) {
    return (
      <Card className="rounded-2xl border border-slate-200" styles={{ body: { padding: 32 } }}>
        <Empty description="Choose an agent to view dashboard metrics." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Agent: <span className="font-semibold text-slate-700">{data?.agent_name || currentAgentName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Radio.Group
            options={TIME_OPTIONS}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className="dashboard-range-group"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Conversations"
              value={data?.totals?.conversations ?? 0}
              note="Total conversations in range"
              Icon={MessageSquareText}
              bgClass="bg-[#f0ebff]"
              colorClass="text-[#6200FF]"
            />
            <StatCard
              label="Messages"
              value={data?.totals?.messages ?? 0}
              note="Inbound + outbound messages"
              Icon={TrendingUp}
              bgClass="bg-[#ecfdf5]"
              colorClass="text-[#059669]"
            />
            <StatCard
              label="Customers"
              value={data?.totals?.customers ?? 0}
              note="Unique contacts in range"
              Icon={Users}
              bgClass="bg-[#fff7ed]"
              colorClass="text-[#d97706]"
            />
          </div>

          {/* Chart */}
          <Card className="rounded-2xl border border-slate-200 shadow-sm" styles={{ body: { padding: 24 } }}>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Trend</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Conversation Volume</h2>
              <p className="mt-0.5 text-sm text-slate-500">Chat activity across the selected time range.</p>
            </div>
            <ConversationChart data={chartData} days={days} />
          </Card>

          {/* Sentiment + FAQ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">

            {/* Sentiment */}
            <Card className="rounded-2xl border border-slate-200 shadow-sm" styles={{ body: { padding: 24 } }}>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Sentiment Breakdown</h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {totalSentiment
                      ? `${fmt.format(totalSentiment)} tagged conversations`
                      : 'No sentiment data yet.'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Smile size={18} strokeWidth={1.8} />
                </div>
              </div>

              <div className="space-y-4">
                {sentiments.map((item) => (
                  <div key={item.key}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg} ${item.text}`}>
                          <item.Icon size={15} strokeWidth={1.8} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-900">{fmt.format(item.value)}</span>
                        <span className="ml-1.5 text-xs text-slate-400">{item.percent}%</span>
                      </div>
                    </div>
                    <Progress
                      percent={item.percent}
                      showInfo={false}
                      strokeColor={item.color}
                      trailColor={item.trail}
                      size={['100%', 6]}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Questions */}
            <Card className="rounded-2xl border border-slate-200 shadow-sm" styles={{ body: { padding: 24 } }}>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Top Asked Questions</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Most repeated prompts for the selected range.</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ebff] text-[#6200FF]">
                  <MessageSquareText size={18} strokeWidth={1.8} />
                </div>
              </div>

              <Table
                rowKey={(r, i) => r?.prompt || r?.id || i}
                dataSource={data?.top_topics || []}
                columns={FAQ_COLUMNS}
                pagination={false}
                size="small"
                locale={{
                  emptyText: (
                    <Empty
                      description="No frequently asked questions yet."
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
