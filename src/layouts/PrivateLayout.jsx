import { Button, Drawer, Grid, Layout, Menu, Modal, Progress, Radio, Tag, Typography, message, theme } from 'antd';
import Cookies from 'js-cookie';
import {
  BarChart3,
  Calendar,
  ClipboardMinus,
  LayoutDashboard,
  Lightbulb,
  MessageCircleReply,
  MessageSquareMore,
  Plug,
  Settings,
  ShoppingBag,
  Users
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import PrivateHeader from '../components/common/privateLayout/PrivateHeader';
import { useContentApi } from '../contexts/ContentApiContext';
import { getAgentById, getData, postData } from '../scripts/api-service';
import { GET_MY_SUBSCRIPTION } from '../scripts/api';

const { Header, Content, Sider } = Layout;

export default function PrivateLayout() {
  const [collapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [indexModalOpen, setIndexModalOpen] = useState(false);
  const [indexFresh, setIndexFresh] = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const [featureFlags, setFeatureFlags] = useState(null);
  const [planCaps, setPlanCaps] = useState(null);

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [openKeys, setOpenKeys] = useState([]);

  const getSelectedKey = () => {
    const parts = location.pathname.split('/');
    const segment = parts[3];
    if (!segment) return 'dashboard';

    const map = {
      'agent-info': 'agent-info',
      'features': 'feature-config',
      'contents': 'contents',
      'documents': 'documents',
      'manage-prompts': 'prompts',
      'website': 'website-integrations',
      'woocommerce': 'woocommerce-integrations',
      'shopify': 'shopify-integrations',
      'chat-widget': 'chat-widget',
      'facebook': 'facebook-integrations',
      'instagram': 'instagram-integrations',
      'whatsapp': 'whatsapp-integrations',
      'customers': 'customers',
      'chat-history': 'chat-history',
      'support': 'support',
      'leads': 'leads',
      'bookings': 'bookings-list',
      'booking-windows': 'booking-windows',
      'complaints': 'complaints',
      'products': 'products',
      'orders': 'orders',
      'offers': 'offers',
      'report': 'reports',
    };

    return map[segment] || 'dashboard';
  };

  const getParentKey = (selectedKey) => {
    const parentMap = {
      'agent-info': 'agent',
      'feature-config': 'agent',

      'contents': 'knowledge',
      'documents': 'knowledge',
      'prompts': 'knowledge',
      'website-integrations': 'knowledge',
      'woocommerce-integrations': 'knowledge',
      'shopify-integrations': 'knowledge',

      'chat-widget': 'integrations',
      'facebook-integrations': 'integrations',
      'instagram-integrations': 'integrations',
      'whatsapp-integrations': 'integrations',

      'bookings-list': 'bookings',
      'booking-windows': 'bookings',

      'products': 'commerce',
      'orders': 'commerce',
      'offers': 'commerce',
    };

    return parentMap[selectedKey] || null;
  };

  useEffect(() => {
    const parent = getParentKey(getSelectedKey());
    if (parent) {
      setOpenKeys((prev) => (prev.includes(parent) ? prev : [...prev, parent]));
    }
  }, [location.pathname]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  const token = Cookies.get('kotha_token');
  const { setCurrentAgentName } = useContentApi();
  const { Text } = Typography;

  const fetchFeatureConfig = async (agentName) => {
    if (!agentName) {
      setFeatureFlags(null);
      return;
    }

    try {
      const featureData = await getData(`api/agent/${agentName}/features/`);
      setFeatureFlags(featureData || null);
    } catch {
      setFeatureFlags(null);
    }
  };

  const fetchAgent = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [agentData, subData] = await Promise.all([
        getAgentById(id),
        getData(GET_MY_SUBSCRIPTION).catch(() => null),
      ]);
      setAgent(agentData);
      setCurrentAgentName(agentData?.agent_name || null);
      if (subData?.subscription?.plan) setPlanCaps(subData.subscription.plan);
      await fetchFeatureConfig(agentData?.agent_name);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/');
    } else {
      fetchAgent();
    }
  }, [token, id]);

  const toBool = (v) => v === true || v === 'true' || v === 1;

  const showBookingsMenu = featureFlags ? toBool(featureFlags.booking) : true;
  const showComplaintsMenu = featureFlags ? toBool(featureFlags.complaints) : true;

  const websiteSourceType = featureFlags?.website_source_type || 'NONE';
  const ecommerceMode = featureFlags?.ecommerce_mode || 'NONE';

  const showWebsiteIntegration =
    websiteSourceType === 'GENERIC' || websiteSourceType === 'WORDPRESS';

  const showWooIntegration = ecommerceMode === 'WOOCOMMERCE';
  const showShopifyIntegration = ecommerceMode === 'SHOPIFY';
  const showCommerceMenu = ecommerceMode === 'INTERNAL';

  const fetchIndexEndpoint = useMemo(() => {
    if (!agent?.agent_name) return null;
    return `api/agent/${agent.agent_name}/index/`;
  }, [agent]);

  const handleIndexAgent = async () => {
    if (!agent?.agent_name || !fetchIndexEndpoint) {
      message.error('Agent not ready yet. Please try again.');
      return;
    }

    setIndexing(true);
    setIndexProgress(12);

    const tick = setInterval(() => {
      setIndexProgress((prev) => (prev < 88 ? prev + 6 : prev));
    }, 300);

    try {
      const res = await postData(fetchIndexEndpoint, { fresh: indexFresh });
      const data = res?.data ?? res;

      const cleanError = (val) => {
        if (typeof val !== 'string') return 'Index request failed';
        const looksLikeHtml = /<[^>]+>/.test(val);
        return looksLikeHtml ? 'Index request failed' : val;
      };

      if (data?.ok || data?.detail || (res?.status && res.status >= 200 && res.status < 300)) {
        setIndexProgress(100);
        message.success('Agent indexing triggered successfully');
        setTimeout(() => setIndexModalOpen(false), 500);
      } else if (data?.error) {
        const errMsg = cleanError(data.errors || data.error);
        message.error(errMsg);
      } else {
        setIndexProgress(100);
        message.success('Index request sent');
        setTimeout(() => setIndexModalOpen(false), 500);
      }
    } catch {
      message.error('Failed to index agent');
    } finally {
      clearInterval(tick);
      setIndexing(false);
      setTimeout(() => setIndexProgress(0), 600);
    }
  };

  const indexLabel = indexFresh ? 'Index with fresh=true' : 'Index without fresh';

  const knowledgeChildren = [
    {
      key: 'contents',
      label: <Link to={`/${id}/agent-dashboard/contents`}>Contents</Link>,
    },
    {
      key: 'documents',
      label: <Link to={`/${id}/agent-dashboard/documents`}>Documents</Link>,
    },
    {
      key: 'prompts',
      label: <Link to={`/${id}/agent-dashboard/manage-prompts`}>Prompts</Link>,
    },
    showWebsiteIntegration
      ? {
          key: 'website-integrations',
          label: (
            <Link to={`/${id}/agent-dashboard/website`}>
              {websiteSourceType === 'WORDPRESS' ? 'WordPress Data' : 'Website Data'}
            </Link>
          ),
        }
      : null,
    showWooIntegration
      ? {
          key: 'woocommerce-integrations',
          label: <Link to={`/${id}/agent-dashboard/woocommerce`}>WooCommerce Data</Link>,
        }
      : null,
    showShopifyIntegration
      ? {
          key: 'shopify-integrations',
          label: <Link to={`/${id}/agent-dashboard/shopify`}>Shopify Data</Link>,
        }
      : null,
  ].filter(Boolean);

  const integrationsChildren = [
    !planCaps || toBool(planCaps.website_widget)
      ? { key: 'chat-widget', label: <Link to={`/${id}/agent-dashboard/chat-widget`}>Website Widget</Link> }
      : null,
    !planCaps || toBool(planCaps.messenger)
      ? { key: 'facebook-integrations', label: <Link to={`/${id}/agent-dashboard/facebook`}>Facebook</Link> }
      : null,
    !planCaps || toBool(planCaps.instagram)
      ? { key: 'instagram-integrations', label: <Link to={`/${id}/agent-dashboard/instagram`}>Instagram</Link> }
      : null,
    !planCaps || toBool(planCaps.whatsapp)
      ? { key: 'whatsapp-integrations', label: <Link to={`/${id}/agent-dashboard/whatsapp`}>WhatsApp</Link> }
      : null,
  ].filter(Boolean);

  const commerceChildren = [
    {
      key: 'products',
      label: <Link to={`/${id}/agent-dashboard/products`}>Products</Link>,
    },
    {
      key: 'orders',
      label: <Link to={`/${id}/agent-dashboard/orders`}>Orders</Link>,
    },
    {
      key: 'offers',
      label: <Link to={`/${id}/agent-dashboard/offers`}>Offers</Link>,
    },
  ];

  const menuItems = [
    {
      key: 'dashboard',
      icon: <LayoutDashboard size={18} />,
      label: <Link to={`/${id}/agent-dashboard`}>Dashboard</Link>,
    },

    {
      key: 'agent',
      icon: <Settings size={18} />,
      label: 'Agent',
      children: [
        {
          key: 'agent-info',
          label: <Link to={`/${id}/agent-dashboard/agent-info`}>Agent Info</Link>,
        },
        {
          key: 'feature-config',
          label: <Link to={`/${id}/agent-dashboard/features`}>Feature Config</Link>,
        },
      ],
    },

    {
      key: 'knowledge',
      icon: <Lightbulb size={18} />,
      label: 'Knowledge',
      children: knowledgeChildren,
    },

    integrationsChildren.length > 0
      ? {
          key: 'integrations',
          icon: <Plug size={18} />,
          label: 'Integrations',
          children: integrationsChildren,
        }
      : null,

    {
      key: 'customers',
      icon: <Users size={18} />,
      label: <Link to={`/${id}/agent-dashboard/customers`}>Customers</Link>,
    },

    {
      key: 'chat-history',
      icon: <MessageCircleReply size={18} />,
      label: <Link to={`/${id}/agent-dashboard/chat-history`}>Chat History</Link>,
    },

    {
      key: 'support',
      icon: <MessageSquareMore size={18} />,
      label: <Link to={`/${id}/agent-dashboard/support`}>Support Inbox</Link>,
    },

    showBookingsMenu
      ? {
          key: 'bookings',
          icon: <Calendar size={18} />,
          label: 'Bookings',
          children: [
            {
              key: 'bookings-list',
              label: <Link to={`/${id}/agent-dashboard/bookings`}>Manage Bookings</Link>,
            },
            {
              key: 'booking-windows',
              label: <Link to={`/${id}/agent-dashboard/booking-windows`}>Booking Windows</Link>,
            },
          ],
        }
      : null,

    showComplaintsMenu
      ? {
          key: 'complaints',
          icon: <ClipboardMinus size={18} />,
          label: <Link to={`/${id}/agent-dashboard/complaints`}>Complaints</Link>,
        }
      : null,

    showCommerceMenu
      ? {
          key: 'commerce',
          icon: <ShoppingBag size={18} />,
          label: 'Commerce',
          children: commerceChildren,
        }
      : null,

    toBool(planCaps?.analytics)
      ? {
          key: 'reports',
          icon: <BarChart3 size={18} />,
          label: <Link to={`/${id}/agent-dashboard/report`}>Reports</Link>,
        }
      : null,
  ].filter(Boolean);

  const sidebarMenu = (
    <Menu
      className='my-app-menu !mt-6'
      mode="inline"
      selectedKeys={[getSelectedKey()]}
      openKeys={openKeys}
      onOpenChange={setOpenKeys}
      style={{ height: '100%', borderInlineEnd: 0, background: '#000B41' }}
      items={menuItems}
      onClick={() => {
        if (isMobile) {
          setMobileMenuOpen(false);
        }
      }}
    />
  );

  return (
    <Layout className="private-layout-shell">
      <Header
        style={{ background: colorBgContainer }}
        className='private-layout__header !pl-4'
      >
        <PrivateHeader
          isMobile={isMobile}
          loading={loading}
          agentName={agent?.agent_name}
          onMenuOpen={() => setMobileMenuOpen(true)}
          onIndexClick={() => setIndexModalOpen(true)}
        />
      </Header>

      <Layout className="private-layout__body">
        {!isMobile ? (
          <Sider
            width={250}
            style={{ background: '#000B41' }}
            trigger={null}
            collapsible
            collapsed={collapsed}
            className="private-layout__sider"
          >
            {sidebarMenu}
          </Sider>
        ) : null}

        <Drawer
          title={loading ? 'Loading...' : (agent?.agent_name || 'Agent name')}
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={isMobile && mobileMenuOpen}
          width={280}
          styles={{
            body: { padding: 0, background: '#000B41' },
            header: { paddingInline: 16, paddingBlock: 14 },
          }}
        >
          {sidebarMenu}
        </Drawer>

        <Layout
          className="private-layout__content-shell"
          style={{ padding: isMobile ? '16px' : '24px 24px' }}
        >
          <Content
            className="private-layout__content"
            style={{
              padding: isMobile ? 16 : 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <div className="private-layout__content-inner">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <span>Index Agent</span>
            {agent?.agent_name ? <Tag>{agent.agent_name}</Tag> : null}
          </div>
        }
        open={indexModalOpen}
        onCancel={() => {
          setIndexModalOpen(false);
          setIndexProgress(0);
        }}
        onOk={handleIndexAgent}
        okText="Start indexing"
        confirmLoading={indexing}
      >
        <div className="space-y-4">
          <Text className="text-slate-600 block">
            Choose whether to rebuild from scratch (`fresh=true`) or reuse existing index data.
          </Text>

          <Radio.Group
            value={indexFresh}
            onChange={(e) => setIndexFresh(e.target.value)}
            disabled={indexing}
          >
            <div className="flex flex-col gap-2">
              <Radio value={true}>fresh=true (full rebuild)</Radio>
              <Radio value={false}>fresh=false (incremental)</Radio>
            </div>
          </Radio.Group>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <Text strong>Indexing progress</Text>
              <Text type="secondary" className="text-xs uppercase tracking-wide">
                {indexLabel}
              </Text>
            </div>
            <Progress percent={indexProgress} status={indexing ? 'active' : undefined} />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}