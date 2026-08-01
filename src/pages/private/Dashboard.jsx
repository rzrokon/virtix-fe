import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  ReloadOutlined,
  RobotOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Progress,
  Radio,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowRight,
  BookOpen,
  Bot,
  LayoutDashboard,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContentApi } from '../../contexts/ContentApiContext';
import { DELETE_AGENT, UPDATE_AGENT } from '../../scripts/api';
import { deleteData, getData, patchData, postData } from '../../scripts/api-service';

const { Text } = Typography;
const { TextArea } = Input;
const SHOPIFY_LAUNCH_SELECTION_KEY = 'virtix_shopify_launch_last_selected';

const normalizeShopDomain = (value = '') => {
  let v = String(value || '').trim().toLowerCase();
  v = v.replace(/^https?:\/\//, '');
  v = v.replace(/\/.*$/, '');
  if (!v) return '';
  if (!v.endsWith('.myshopify.com')) v = `${v}.myshopify.com`;
  return v;
};

const launchContextApi = (shop, host) =>
  `api/integrations/shopify/launch-context/?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;

const getStoredSelections = () => {
  try {
    return JSON.parse(localStorage.getItem(SHOPIFY_LAUNCH_SELECTION_KEY) || '{}');
  } catch {
    return {};
  }
};

const getStoredSelectionForShop = (shop) => {
  const normalizedShop = normalizeShopDomain(shop);
  if (!normalizedShop) return null;

  const value = getStoredSelections()[normalizedShop];
  if (!value) return null;

  if (typeof value === 'number' || typeof value === 'string') {
    const agentId = Number(value);
    return agentId ? { last_selected_agent_id: agentId, last_selected_at: null } : null;
  }

  if (typeof value === 'object') {
    const agentId = Number(value.last_selected_agent_id || 0);
    if (!agentId) return null;
    return {
      last_selected_agent_id: agentId,
      last_selected_at: value.last_selected_at || null,
    };
  }

  return null;
};

const logShopifyLaunchSelectionEvent = (eventName, payload = {}) => {
  console.info(eventName, payload);
};

const rememberLaunchSelection = (shop, agentId) => {
  const normalizedShop = normalizeShopDomain(shop);
  if (!normalizedShop || !agentId) return;

  const current = getStoredSelections();
  current[normalizedShop] = {
    last_selected_agent_id: Number(agentId),
    last_selected_at: new Date().toISOString(),
  };
  localStorage.setItem(SHOPIFY_LAUNCH_SELECTION_KEY, JSON.stringify(current));
  logShopifyLaunchSelectionEvent('SHOPIFY_LAST_AGENT_SELECTED', {
    shop_domain: normalizedShop,
    agent_id: Number(agentId),
  });
};

const clearLaunchSelection = (shop, reason = 'cleared') => {
  const normalizedShop = normalizeShopDomain(shop);
  if (!normalizedShop) return;

  const current = getStoredSelections();
  if (!(normalizedShop in current)) return;

  delete current[normalizedShop];
  localStorage.setItem(SHOPIFY_LAUNCH_SELECTION_KEY, JSON.stringify(current));
  logShopifyLaunchSelectionEvent('SHOPIFY_LAST_AGENT_CLEARED', {
    shop_domain: normalizedShop,
    reason,
  });
};

const QUICK_GUIDES = [
  {
    icon: Bot,
    title: 'Create your first agent',
    summary: 'Set up an agent with a name, heading, description, and branding assets.',
    steps: ['Click "Create Agent" above', 'Fill in agent name, heading and description', 'Upload logo and branding assets', 'Click Submit'],
    color: 'text-[#6200FF]',
    bg: 'bg-[#f0ebff]',
  },
  {
    icon: Settings,
    title: 'Configure agent features',
    summary: 'Enable bookings, complaints, commerce, and knowledge sources for the agent.',
    steps: ['Open the agent dashboard', 'Go to Agent → Feature Config', 'Toggle the capabilities your business needs', 'Save changes'],
    color: 'text-[#059669]',
    bg: 'bg-[#ecfdf5]',
  },
  {
    icon: BookOpen,
    title: 'Build your knowledge base',
    summary: 'Add articles, upload documents, and connect a website or WooCommerce store.',
    steps: ['Open Knowledge → Contents', 'Click New to add a knowledge article', 'Upload relevant documents', 'Connect your website or store'],
    color: 'text-[#d97706]',
    bg: 'bg-[#fff7ed]',
  },
  {
    icon: LayoutDashboard,
    title: 'Monitor with the dashboard',
    summary: 'Track conversations, messages, customer sentiment, and top questions.',
    steps: ['Open your agent dashboard', 'Review conversation and message counts', 'Check sentiment breakdown', 'Read top asked questions'],
    color: 'text-[#2563eb]',
    bg: 'bg-[#eff6ff]',
  },
];

export default function Dashboard() {
  const { agents, fetchAgents, refreshAgents } = useContentApi();
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode]                 = useState('grid');
  const [selectedAgent, setSelectedAgent]       = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting]                 = useState(false);
  const [searchTerm, setSearchTerm]             = useState('');
  const [refreshing, setRefreshing]             = useState(false);
  const [indexModalVisible, setIndexModalVisible] = useState(false);
  const [indexFresh, setIndexFresh]             = useState(true);
  const [indexing, setIndexing]                 = useState(false);
  const [indexProgress, setIndexProgress]       = useState(0);
  const [expandedGuide, setExpandedGuide]       = useState(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm]                              = Form.useForm();
  const [updating, setUpdating]                 = useState(false);
  const [launchState, setLaunchState]           = useState({
    active: false,
    loading: false,
    error: '',
    shop: '',
    host: '',
    data: null,
  });
  const [showConnectExisting, setShowConnectExisting] = useState(false);
  const [showAllLaunchAgents, setShowAllLaunchAgents] = useState(false);

  useEffect(() => { fetchAgents(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shop = normalizeShopDomain(params.get('shop') || '');
    const host = (params.get('host') || '').trim();

    if (!shop || !host) {
      setLaunchState({
        active: false,
        loading: false,
        error: '',
        shop: '',
        host: '',
        data: null,
      });
      return;
    }

    let cancelled = false;

    const loadLaunchContext = async () => {
      setLaunchState({
        active: true,
        loading: true,
        error: '',
        shop,
        host,
        data: null,
      });

      try {
        const data = await getData(launchContextApi(shop, host), false, true);
        if (cancelled) return;

        if (data?.status === 'single_agent' && data?.agent?.redirect_url) {
          rememberLaunchSelection(shop, data.agent.id);
          navigate(data.agent.redirect_url, { replace: true });
          return;
        }

        setLaunchState({
          active: true,
          loading: false,
          error: '',
          shop,
          host,
          data,
        });
      } catch (error) {
        if (cancelled) return;
        const detail =
          error?.response?.data?.detail ||
          (error?.response?.status === 403
            ? 'You do not have access to the Virtix agents connected to this Shopify store.'
            : 'Shopify launch context could not be resolved.');
        setLaunchState({
          active: true,
          loading: false,
          error: detail,
          shop,
          host,
          data: null,
        });
      }
    };

    loadLaunchContext();
    return () => {
      cancelled = true;
    };
  }, [location.search, navigate]);

  const handleEditAgent = async (values) => {
    if (!selectedAgent) return;
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('agent_name', values.agent_name);
      formData.append('agent_heading', values.agent_heading);
      formData.append('agent_description', values.agent_description);
      const response = await patchData(`${UPDATE_AGENT}${selectedAgent.id}/`, formData);
      if (response) {
        message.success('Agent updated successfully!');
        setEditModalVisible(false);
        editForm.resetFields();
        refreshAgents();
      }
    } catch {
      message.error('Failed to update agent. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;
    setDeleting(true);
    try {
      const response = await deleteData(`${DELETE_AGENT}${selectedAgent.id}/`);
      if (response) {
        message.success('Agent deleted successfully');
        refreshAgents();
        setDeleteModalVisible(false);
        setSelectedAgent(null);
      }
    } catch {
      message.error('Failed to delete agent');
    } finally {
      setDeleting(false);
    }
  };

  const handleMenuClick = (e, agent) => {
    if (e.key === '1') {
      setSelectedAgent(agent);
      editForm.setFieldsValue({
        agent_name: agent.agent_name,
        agent_heading: agent.agent_heading,
        agent_description: agent.agent_description,
      });
      setEditModalVisible(true);
    } else if (e.key === '2') {
      setSelectedAgent(agent);
      setDeleteModalVisible(true);
    } else if (e.key === '3') {
      setSelectedAgent(agent);
      setIndexFresh(true);
      setIndexProgress(0);
      setIndexModalVisible(true);
    }
  };

  const handleIndexAgent = async () => {
    if (!selectedAgent) return;
    setIndexing(true);
    setIndexProgress(12);
    const tick = setInterval(() => {
      setIndexProgress((prev) => (prev < 88 ? prev + 6 : prev));
    }, 300);
    try {
      const slug = selectedAgent?.agent_name || 'kotha';
      const res  = await postData(`api/agent/${slug}/index/`, { fresh: indexFresh });
      const data = res?.data ?? res;
      const cleanError = (val) => {
        if (typeof val !== 'string') return 'Index request failed';
        return /<[^>]+>/.test(val) ? 'Index request failed' : val;
      };
      if (data?.ok || (res?.status && res.status >= 200 && res.status < 300)) {
        setIndexProgress(100);
        message.success('Agent indexing triggered successfully');
        setTimeout(() => setIndexModalVisible(false), 500);
      } else if (data?.error) {
        message.error(cleanError(data.errors || data.error));
      } else {
        setIndexProgress(100);
        message.success('Index request sent');
        setTimeout(() => setIndexModalVisible(false), 500);
      }
    } catch {
      message.error('Failed to build AI knowledge');
    } finally {
      clearInterval(tick);
      setIndexing(false);
      setTimeout(() => setIndexProgress(0), 600);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAgents();
    } catch {
      message.error('Unable to refresh agents right now.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredAgents = (agents?.results || []).filter((agent) => {
    const haystack = `${agent.agent_name ?? ''} ${agent.agent_heading ?? ''} ${agent.agent_description ?? ''}`.toLowerCase();
    return haystack.includes(searchTerm.trim().toLowerCase());
  });

  const totalAgents = agents?.count ?? agents?.results?.length ?? 0;
  const lastSelectedLaunch = useMemo(() => getStoredSelectionForShop(launchState.shop), [launchState.shop]);
  const lastSelectedAgentId = lastSelectedLaunch?.last_selected_agent_id || 0;
  const launchAgents = useMemo(
    () => (Array.isArray(launchState.data?.agents) ? [...launchState.data.agents] : []),
    [launchState.data]
  );
  const lastSelectedLaunchAgent = useMemo(
    () => launchAgents.find((agent) => agent.id === lastSelectedAgentId) || null,
    [launchAgents, lastSelectedAgentId]
  );
  const sortedLaunchAgents = useMemo(() => {
    const list = [...launchAgents];
    if (!lastSelectedLaunchAgent) {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list.sort((a, b) => {
      if (a.id === lastSelectedLaunchAgent.id) return -1;
      if (b.id === lastSelectedLaunchAgent.id) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [launchAgents, lastSelectedLaunchAgent]);

  useEffect(() => {
    if (!(launchState.active && launchState.data?.status === 'multiple_agents')) {
      setShowAllLaunchAgents(false);
      return;
    }

    if (!lastSelectedAgentId) {
      setShowAllLaunchAgents(true);
      return;
    }

    if (lastSelectedLaunchAgent) {
      logShopifyLaunchSelectionEvent('SHOPIFY_LAST_AGENT_USED', {
        shop_domain: launchState.shop,
        agent_id: lastSelectedLaunchAgent.id,
      });
      setShowAllLaunchAgents(false);
      return;
    }

    logShopifyLaunchSelectionEvent('SHOPIFY_LAST_AGENT_INVALID', {
      shop_domain: launchState.shop,
      agent_id: lastSelectedAgentId,
    });
    clearLaunchSelection(launchState.shop, 'invalid');
    setShowAllLaunchAgents(true);
  }, [
    launchState.active,
    launchState.data,
    launchState.shop,
    lastSelectedAgentId,
    lastSelectedLaunchAgent,
  ]);

  const openCreateAgentModal = () => {
    window.dispatchEvent(new CustomEvent('open-create-agent'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLaunchAgent = (agent) => {
    rememberLaunchSelection(launchState.shop, agent.id);
    navigate(agent.redirect_url || `/${agent.id}/agent-dashboard/shopify`);
  };

  const agentMenuItems = [
    { key: '1', label: <Space><EditOutlined /> Edit agent</Space> },
    { key: '3', label: <Space><ReloadOutlined /> Index agent</Space> },
    { key: '2', label: <Space><DeleteOutlined /> Delete agent</Space>, danger: true },
  ];

  if (launchState.active && launchState.loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-screen-md mx-auto p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0ebff]">
              <Sparkles size={24} className="text-[#6200FF]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Opening Shopify workspace</h2>
            <p className="mt-2 text-sm text-slate-500">
              Resolving the Virtix agents connected to <strong>{launchState.shop}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (launchState.active && launchState.data?.status === 'multiple_agents') {
    const showContinueScreen = !!lastSelectedLaunchAgent && !showAllLaunchAgents;

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-screen-lg mx-auto p-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm font-semibold text-[#6200FF]">Connected Shopify Store</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{launchState.shop}</h1>
            <p className="mt-3 text-sm text-slate-500">
              {showContinueScreen
                ? 'Continue with your last used Virtix agent or choose another connected agent.'
                : 'Choose which Virtix agent you want to manage from Shopify Admin.'}
            </p>
          </div>

          {showContinueScreen ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Continue with your last used Virtix Agent?</p>
              <div className="mt-5 flex items-start gap-4">
                <Avatar
                  size={56}
                  src={lastSelectedLaunchAgent.logo || undefined}
                  icon={!lastSelectedLaunchAgent.logo ? <RobotOutlined /> : undefined}
                  className="bg-[#f0ebff] text-[#6200FF]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">{lastSelectedLaunchAgent.name}</h2>
                    <Tag color="purple">Last Used</Tag>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {lastSelectedLaunchAgent.description || 'No description added yet.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Tag color={lastSelectedLaunchAgent.health_status === 'Healthy' ? 'green' : 'gold'}>
                      {lastSelectedLaunchAgent.health_status}
                    </Tag>
                    <Tag>{lastSelectedLaunchAgent.billing_status}</Tag>
                    <Tag>{lastSelectedLaunchAgent.connection_status}</Tag>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    Last Sync:{' '}
                    {lastSelectedLaunchAgent.last_sync_at
                      ? new Date(lastSelectedLaunchAgent.last_sync_at).toLocaleString()
                      : 'No sync yet'}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="primary"
                  className="bg-[#6200FF] border-[#6200FF] hover:bg-[#5000CC]"
                  onClick={() => openLaunchAgent(lastSelectedLaunchAgent)}
                >
                  Continue
                </Button>
                <Button onClick={() => setShowAllLaunchAgents(true)}>Choose Another Agent</Button>
              </div>
            </div>
          ) : null}

          {showAllLaunchAgents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedLaunchAgents.map((agent) => (
                <div key={agent.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <Avatar
                      size={48}
                      src={agent.logo || undefined}
                      icon={!agent.logo ? <RobotOutlined /> : undefined}
                      className="bg-[#f0ebff] text-[#6200FF]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-semibold text-slate-900">{agent.name}</h2>
                        {agent.id === lastSelectedAgentId ? (
                          <Tag color="purple">Last Used</Tag>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{agent.description || 'No description added yet.'}</p>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-500">
                        <div>
                          <p className="font-medium text-slate-900">Connection Status</p>
                          <p>{agent.connection_status}</p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Health Status</p>
                          <p>{agent.health_status}</p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Billing Status</p>
                          <p>{agent.billing_status}</p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Last Sync</p>
                          <p>{agent.last_sync_at ? new Date(agent.last_sync_at).toLocaleString() : 'No sync yet'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    className="mt-5 bg-[#6200FF] border-[#6200FF] hover:bg-[#5000CC]"
                    onClick={() => openLaunchAgent(agent)}
                  >
                    Open
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (launchState.active && launchState.error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-screen-md mx-auto p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm font-semibold text-[#6200FF]">Shopify Launch</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Access unavailable</h1>
            <p className="mt-3 text-sm text-slate-500">
              This Shopify Store is connected to Virtix, but your account does not have permission to access any
              connected agent.
            </p>
            <p className="mt-2 text-sm text-slate-400">{launchState.error}</p>
            <Button className="mt-6" type="primary" onClick={() => navigate('/dashboard', { replace: true })}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (launchState.active && launchState.data?.status === 'not_connected') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-screen-xl mx-auto p-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm font-semibold text-[#6200FF]">Shopify Launch</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{launchState.shop || 'Shopify Store'}</h1>
            <p className="mt-3 text-sm text-slate-500">
              This Shopify Store isn&apos;t connected to any Virtix Agent.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="primary"
                icon={<Plus size={15} />}
                className="bg-[#6200FF] border-[#6200FF] hover:bg-[#5000CC]"
                onClick={openCreateAgentModal}
              >
                Create a new Agent
              </Button>
              <Button onClick={() => setShowConnectExisting((prev) => !prev)}>
                Connect an existing Agent
              </Button>
            </div>
          </div>

          {showConnectExisting ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Available Virtix Agents</h2>
                <p className="text-sm text-slate-500">
                  Open an agent’s Shopify settings to connect <strong>{launchState.shop}</strong>.
                </p>
              </div>
              {filteredAgents.length === 0 ? (
                <Empty description="No accessible agents found." image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAgents.map((agent) => (
                    <div key={agent.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="font-semibold text-slate-900">{agent.agent_heading || agent.agent_name}</p>
                      <p className="mt-1 text-sm text-slate-500">{agent.agent_description || 'No description added yet.'}</p>
                      <Button
                        className="mt-4"
                        type="primary"
                        onClick={() => navigate(`/${agent.id}/agent-dashboard/shopify?shop=${encodeURIComponent(launchState.shop)}`)}
                      >
                        Open Shopify Settings
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto p-4 md:p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Agents</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {totalAgents === 0
                ? 'No agents yet — create your first one to get started.'
                : `${totalAgents} agent${totalAgents > 1 ? 's' : ''} in your workspace`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search agents…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!w-[220px]"
            />
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {viewMode === 'grid' ? <List size={15} /> : <LayoutGrid size={15} />}
              {viewMode === 'grid' ? 'List' : 'Grid'}
            </button>
            <Button icon={<RefreshCw size={14} />} onClick={handleRefresh} loading={refreshing}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<Plus size={15} />}
              onClick={openCreateAgentModal}
              className="bg-[#6200FF] border-[#6200FF] hover:bg-[#5000CC]"
            >
              Create Agent
            </Button>
          </div>
        </div>

        {/* Main content: agents + guide sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">

          {/* Agent list */}
          <div>
            {filteredAgents.length === 0 ? (
              totalAgents === 0 ? (
                /* Empty state — getting started */
                <div className="rounded-2xl border border-dashed border-[#6200FF]/20 bg-white p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0ebff]">
                    <Sparkles size={28} className="text-[#6200FF]" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Create your first agent</h2>
                  <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                    An agent is your AI-powered assistant. Set it up with knowledge, connect channels, and let it handle customer conversations.
                  </p>
                  <Button
                    type="primary"
                    size="large"
                    icon={<Plus size={16} />}
                    onClick={openCreateAgentModal}
                    className="mt-6 bg-[#6200FF] border-[#6200FF] hover:bg-[#5000CC]"
                  >
                    Create your first agent
                  </Button>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    {['Give the agent a name and heading', 'Add knowledge so it can answer questions', 'Connect a channel like website widget or WhatsApp'].map((step, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#6200FF] text-xs font-bold text-white">{i + 1}</div>
                        <p className="text-sm text-slate-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Empty
                  description={<span className="text-slate-500">No agents match your search.</span>}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="py-12 bg-white rounded-2xl border border-slate-200"
                />
              )
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-[#6200FF]/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 p-5 pb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0ebff]">
                          <RobotOutlined className="text-[#6200FF] text-lg" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{agent.agent_name}</p>
                          <p className="text-xs text-slate-400 truncate">{agent.agent_heading || 'No heading'}</p>
                        </div>
                      </div>
                      <Dropdown
                        menu={{ items: agentMenuItems, onClick: (e) => handleMenuClick(e, agent) }}
                        trigger={['click']}
                      >
                        <Button type="text" size="small" icon={<MoreOutlined />} className="text-slate-400 shrink-0" />
                      </Dropdown>
                    </div>

                    <div className="px-5 pb-4 flex-1">
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                        {agent.agent_description || 'No description added yet.'}
                      </p>
                    </div>

                    <div className="px-5 pb-5">
                      <Link to={`/${agent.id}/agent-dashboard`}>
                        <Button
                          type="primary"
                          className="w-full bg-[#6200FF] border-[#6200FF] hover:bg-[#5000CC]"
                        >
                          Open agent dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 hover:border-[#6200FF]/20 hover:shadow-sm transition-all"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0ebff]">
                      <RobotOutlined className="text-[#6200FF] text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{agent.agent_name}</p>
                      <p className="text-xs text-slate-400">{agent.agent_heading || 'No heading'}</p>
                      <p className="mt-1 text-sm text-slate-500 line-clamp-1">
                        {agent.agent_description || 'No description added yet.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/${agent.id}/agent-dashboard`}>
                        <Button type="primary" className="bg-[#6200FF] border-[#6200FF] hover:bg-[#5000CC]">
                          Open agent dashboard
                        </Button>
                      </Link>
                      <Dropdown
                        menu={{ items: agentMenuItems, onClick: (e) => handleMenuClick(e, agent) }}
                        trigger={['click']}
                      >
                        <Button type="text" icon={<MoreOutlined />} className="text-slate-400" />
                      </Dropdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Getting started guide sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-[#6200FF]" />
                <h3 className="font-semibold text-slate-900 text-sm">Getting started</h3>
              </div>
              <div className="space-y-3">
                {QUICK_GUIDES.map((guide, i) => {
                  const isOpen = expandedGuide === i;
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-100 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedGuide(isOpen ? null : i)}
                        className="w-full flex items-start gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${guide.bg}`}>
                          <guide.icon size={15} className={guide.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 leading-snug">{guide.title}</p>
                          {!isOpen && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{guide.summary}</p>
                          )}
                        </div>
                        <ArrowRight
                          size={14}
                          className={`shrink-0 mt-0.5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 pt-0">
                          <p className="text-xs text-slate-500 mb-2">{guide.summary}</p>
                          <ol className="space-y-1.5">
                            {guide.steps.map((step, si) => (
                              <li key={si} className="flex items-start gap-2 text-xs text-slate-600">
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#6200FF] text-[9px] font-bold text-white mt-0.5">
                                  {si + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <a
                href="/help-center"
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-[#6200FF]/20 bg-[#f0ebff] px-3 py-2 text-xs font-semibold text-[#6200FF] hover:bg-[#e8dfff] transition-colors"
              >
                <BookOpen size={13} />
                View full help center
              </a>
            </div>

            {totalAgents > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-slate-900 text-sm mb-3">Workspace stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total agents</span>
                    <span className="font-semibold text-slate-900">{totalAgents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Showing</span>
                    <span className="font-semibold text-slate-900">{filteredAgents.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">View</span>
                    <Tag className="!rounded-full !m-0 !text-xs">{viewMode === 'grid' ? 'Grid' : 'List'}</Tag>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        title="Delete Agent"
        open={deleteModalVisible}
        onOk={handleDeleteAgent}
        onCancel={() => { setDeleteModalVisible(false); setSelectedAgent(null); }}
        confirmLoading={deleting}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete <strong>{selectedAgent?.agent_name}</strong>? This cannot be undone.
        </p>
      </Modal>

      {/* Index modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span>Build AI Knowledge</span>
            {selectedAgent?.agent_name ? <Tag>{selectedAgent.agent_name}</Tag> : null}
          </div>
        }
        open={indexModalVisible}
        onCancel={() => { setIndexModalVisible(false); setIndexProgress(0); }}
        onOk={handleIndexAgent}
        okText="Build Now"
        confirmLoading={indexing}
      >
        <div className="space-y-4">
          <Text className="text-slate-600 block">
            Teach your AI agent about your store — it will learn from your website content, products, and settings so it can answer customer questions accurately.
          </Text>
          <Radio.Group value={indexFresh} onChange={(e) => setIndexFresh(e.target.value)} disabled={indexing}>
            <div className="flex flex-col gap-3">
              <Radio value={true}>
                <div>
                  <div className="font-medium">Full rebuild</div>
                  <div className="text-xs text-slate-500">Start fresh — recommended after major content changes or when the agent gives outdated answers.</div>
                </div>
              </Radio>
              <Radio value={false}>
                <div>
                  <div className="font-medium">Quick update</div>
                  <div className="text-xs text-slate-500">Only sync new or changed content — faster, ideal for minor updates.</div>
                </div>
              </Radio>
            </div>
          </Radio.Group>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <Text strong>Build progress</Text>
              <Text type="secondary" className="text-xs">{indexFresh ? 'Full rebuild' : 'Quick update'}</Text>
            </div>
            <Progress percent={indexProgress} status={indexing ? 'active' : undefined} />
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        title="Edit Agent"
        open={editModalVisible}
        footer={null}
        onCancel={() => { setEditModalVisible(false); editForm.resetFields(); }}
        width={600}
      >
        <Form form={editForm} layout="vertical" size="large" onFinish={handleEditAgent} className="mt-4">
          <Form.Item
            label="Agent Name"
            name="agent_name"
            rules={[
              { required: true, message: 'Please enter agent name' },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Only letters, numbers, underscores or hyphens.' },
            ]}
          >
            <Input readOnly />
          </Form.Item>
          <Form.Item label="Agent Heading" name="agent_heading" rules={[{ required: true, message: 'Please enter agent heading' }]}>
            <Input placeholder="e.g. Hi! How can I help you today?" />
          </Form.Item>
          <Form.Item label="Agent Description" name="agent_description" rules={[{ required: true, message: 'Please enter agent description' }]}>
            <TextArea rows={4} placeholder="Describe what this agent does…" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-[#6200FF] border-[#6200FF]" loading={updating}>
              Update Agent
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
