import { Line } from '@ant-design/plots';
import { Card, Col, Empty, Progress, Radio, Row, Spin, Table, Tag, message } from 'antd';
import {
  Bot,
  CalendarRange,
  Frown,
  Meh,
  MessageSquareText,
  Smile,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useContentApi } from '../../contexts/ContentApiContext';
import { getData } from '../../scripts/api-service';

const FAQ_COLUMNS = [
  {
    title: '#',
    key: 'rank',
    width: 72,
    render: (_, __, index) => (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f3efe7] text-xs font-semibold text-[#6f624d]">
        {index + 1}
      </span>
    ),
  },
  {
    title: 'Question',
    dataIndex: 'prompt',
    key: 'prompt',
    render: (value) => <span className="font-medium text-slate-800">{value || 'Untitled question'}</span>,
  },
  {
    title: 'Times Asked',
    dataIndex: 'count',
    key: 'count',
    width: 140,
    align: 'right',
    render: (value) => <span className="font-semibold text-slate-900">{value ?? 0}</span>,
  },
]

const TIME_RANGE_OPTIONS = [
  { label: 'Daily', value: 1 },
  { label: 'Weekly', value: 7 },
  { label: 'Monthly', value: 30 },
]

const SENTIMENT_META = {
  positive: {
    label: 'Positive',
    Icon: Smile,
    accent: '#1f9d61',
    trail: '#dff5ea',
    bg: 'bg-[#edf9f2]',
    text: 'text-[#1f9d61]',
  },
  neutral: {
    label: 'Neutral',
    Icon: Meh,
    accent: '#d18b18',
    trail: '#f8ebcc',
    bg: 'bg-[#fff7e7]',
    text: 'text-[#a96e13]',
  },
  negative: {
    label: 'Negative',
    Icon: Frown,
    accent: '#d45d52',
    trail: '#f8dfdc',
    bg: 'bg-[#fff0ee]',
    text: 'text-[#b5453b]',
  },
}

const numberFormatter = new Intl.NumberFormat('en-US')

const buildMetricCards = (dashboardData) => [
  {
    key: 'agent',
    label: 'Agent',
    value: dashboardData?.agent_name || 'Unknown',
    note: 'Current workspace agent',
    Icon: Bot,
    iconClasses: 'bg-[#f5efff] text-[#7c3aed]',
  },
  {
    key: 'conversations',
    label: 'Conversations',
    value: dashboardData?.totals?.conversations ?? 0,
    note: 'Tracked during the selected time range',
    Icon: MessageSquareText,
    iconClasses: 'bg-[#eaf2ff] text-[#2563eb]',
  },
  {
    key: 'messages',
    label: 'Messages',
    value: dashboardData?.totals?.messages ?? 0,
    note: 'All inbound and outbound messages',
    Icon: TrendingUp,
    iconClasses: 'bg-[#ecfdf3] text-[#039855]',
  },
  {
    key: 'customers',
    label: 'Customers',
    value: dashboardData?.totals?.customers ?? 0,
    note: 'Unique contacts interacting with the agent',
    Icon: Users,
    iconClasses: 'bg-[#fff4e8] text-[#d97706]',
  },
]

const getSeriesForRange = (dashboardData, days) => {
  if (!dashboardData) return []

  if (days === 1) {
    return dashboardData?.last_24h || dashboardData?.today || dashboardData?.daily || dashboardData?.last_7d || []
  }

  if (days === 30) {
    return dashboardData?.last_30d || dashboardData?.monthly || dashboardData?.last_7d || []
  }

  return dashboardData?.last_7d || dashboardData?.weekly || []
}

const formatSeriesLabel = (rawDate, days) => {
  if (!rawDate) return '-'

  const date = new Date(rawDate)
  if (Number.isNaN(date.getTime())) return String(rawDate)

  if (days === 1) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const normalizeSentiments = (dashboardData) => {
  const source =
    dashboardData?.sentiments ||
    dashboardData?.sentiment_breakdown ||
    dashboardData?.sentiment ||
    dashboardData?.totals?.sentiments ||
    {}

  const positive = Number(source.positive ?? source.pos ?? 0)
  const neutral = Number(source.neutral ?? source.mixed ?? 0)
  const negative = Number(source.negative ?? source.neg ?? 0)
  const total = positive + neutral + negative

  return ['positive', 'neutral', 'negative'].map((key) => {
    const value = key === 'positive' ? positive : key === 'neutral' ? neutral : negative
    return {
      key,
      value,
      percent: total ? Math.round((value / total) * 100) : 0,
      ...SENTIMENT_META[key],
    }
  })
}

const ChartEmptyState = ({ messageText }) => (
  <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70">
    <div className="text-center">
      <CalendarRange className="mx-auto mb-3 h-9 w-9 text-slate-300" />
      <p className="text-sm font-medium text-slate-600">{messageText}</p>
    </div>
  </div>
)

const MetricsCard = ({ item }) => {
  const displayValue = typeof item.value === 'number' ? numberFormatter.format(item.value) : item.value

  return (
    <Card
      className="h-full rounded-3xl border border-slate-200 shadow-sm"
      styles={{ body: { padding: 20 } }}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.iconClasses}`}>
          <item.Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{item.label}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{displayValue}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
        </div>
      </div>
    </Card>
  )
}

const ConversationLine = ({ data, days }) => {
  if (!data?.length) {
    return <ChartEmptyState messageText="No chat volume data for this range yet." />
  }

  const transformedData = data.map((item) => ({
    date: formatSeriesLabel(item.date || item.day || item.label, days),
    count: Number(item.count ?? item.total ?? 0),
  }))

  const config = {
    data: transformedData,
    xField: 'date',
    yField: 'count',
    height: 300,
    smooth: true,
    color: '#1d4ed8',
    point: {
      shapeField: 'circle',
      sizeField: 4,
      style: {
        fill: '#ffffff',
        stroke: '#1d4ed8',
        lineWidth: 2,
      },
    },
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 3,
    },
    axis: {
      x: {
        labelAutoRotate: false,
        tick: false,
        title: false,
      },
      y: {
        grid: true,
        title: false,
      },
    },
  }

  return <Line {...config} />
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)
  const { currentAgentName } = useContentApi()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        if (!currentAgentName) {
          setDashboardData(null)
          return
        }

        const data = await getData(`api/agent/${currentAgentName}/dashboard/?days=${days}&top=5`)
        setDashboardData(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        message.error('Error loading dashboard')
        setDashboardData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [days, currentAgentName])

  const metricCards = useMemo(() => buildMetricCards(dashboardData), [dashboardData])
  const chartData = useMemo(() => getSeriesForRange(dashboardData, days), [dashboardData, days])
  const sentiments = useMemo(() => normalizeSentiments(dashboardData), [dashboardData])
  const totalSentimentResponses = sentiments.reduce((sum, item) => sum + item.value, 0)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!currentAgentName) {
    return (
      <Card className="rounded-[28px] border border-slate-200 shadow-sm" styles={{ body: { padding: 32 } }}>
        <Empty
          description="Choose an agent to view dashboard metrics."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Monitor how <span className="font-semibold text-slate-900">{dashboardData?.agent_name || currentAgentName}</span> is performing across conversations and customer activity.
        </p>
      </div>

      <Row gutter={[16, 16]}>
        {metricCards.map((item) => (
          <Col key={item.key} xs={24} sm={12} xl={6}>
            <MetricsCard item={item} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card
            className="rounded-[28px] border border-slate-200 shadow-sm"
            styles={{ body: { padding: 24 } }}
          >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Trend</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Conversation Volume</h2>
                <p className="mt-1 text-sm text-slate-500">Shows how chat activity changes across the selected range.</p>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                <div className="hidden rounded-2xl bg-[#eef4ff] p-3 text-[#1d4ed8] sm:block">
                  <TrendingUp className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div className="w-full sm:w-auto">
                  <Radio.Group
                    className="dashboard-range-group"
                    options={TIME_RANGE_OPTIONS}
                    onChange={(e) => setDays(e.target.value)}
                    value={days}
                    optionType="button"
                    buttonStyle="solid"
                  />
                </div>
              </div>
            </div>

            <ConversationLine data={chartData} days={days} />
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card
            className="h-full rounded-[28px] border border-slate-200 shadow-sm"
            styles={{ body: { padding: 24 } }}
          >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {/* <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Quality</p> */}
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Sentiment Breakdown</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {totalSentimentResponses
                    ? `${numberFormatter.format(totalSentimentResponses)} sentiment-tagged conversations`
                    : 'No sentiment data has been captured yet.'}
                </p>
              </div>
              <div className="rounded-2xl bg-[#fff7e7] p-3 text-[#b7791f]">
                <Smile className="h-5 w-5" strokeWidth={1.8} />
              </div>
            </div>

            <div className="space-y-4">
              {sentiments.map((item) => (
                <div key={item.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.bg} ${item.text}`}>
                        <item.Icon className="h-5 w-5" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.percent}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-950">{numberFormatter.format(item.value)}</p>
                      <p className="text-xs text-slate-500">conversations</p>
                    </div>
                  </div>

                  <Progress
                    percent={item.percent}
                    showInfo={false}
                    strokeColor={item.accent}
                    trailColor={item.trail}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        className="rounded-[28px] border border-slate-200 shadow-sm"
        styles={{ body: { padding: 24 } }}
      >
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {/* <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Knowledge</p> */}
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Top Asked Question</h2>
            <p className="mt-1 text-sm text-slate-500">Most repeated prompts from users for the current dashboard range.</p>
          </div>
          <div className="rounded-2xl bg-[#f3efe7] p-3 text-[#8a6c42]">
            <MessageSquareText className="h-5 w-5" strokeWidth={1.8} />
          </div>
        </div>

        <Table
          rowKey={(record, index) => record?.prompt || record?.id || index}
          dataSource={dashboardData?.top_topics || []}
          columns={FAQ_COLUMNS}
          pagination={false}
          locale={{
            emptyText: <Empty description="No frequently asked questions yet." image={Empty.PRESENTED_IMAGE_SIMPLE} />,
          }}
        />
      </Card>
    </div>
  )
}
