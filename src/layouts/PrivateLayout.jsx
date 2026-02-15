import { Button, Layout, Menu, Modal, Progress, Radio, Tag, Typography, message, theme } from 'antd';
import Cookies from 'js-cookie';
import { Calendar, ClipboardMinus, Files, LayoutDashboard, Lightbulb, Settings, ShoppingBag, SquareChartGantt, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import UserMenu from '../components/common/privateLayout/UserMenu';
import { useContentApi } from '../contexts/ContentApiContext';
import { getAgentById, postData } from '../scripts/api-service';
const { Header, Content, Sider } = Layout;

export default function PrivateLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [indexModalOpen, setIndexModalOpen] = useState(false);
  const [indexFresh, setIndexFresh] = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const { id } = useParams();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const token = Cookies.get('kotha_token')
  const { setCurrentAgentName } = useContentApi();
  const { Text } = Typography;

  // Fetch agent data by ID using api-service
  const fetchAgent = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const agentData = await getAgentById(id);
      setAgent(agentData);
      // Store agent_name in context
      setCurrentAgentName(agentData?.agent_name || null);
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location = '/'
    } else {
      fetchAgent();
    }
  }, [token, id])

  const handleIndexAgent = async () => {
    if (!agent?.agent_name) {
      message.error('Agent not ready yet. Please try again.');
      return;
    }

    setIndexing(true);
    setIndexProgress(12);
    const tick = setInterval(() => {
      setIndexProgress((prev) => (prev < 88 ? prev + 6 : prev));
    }, 300);

    try {
      const res = await postData(`api/agent/${agent.agent_name}/index/`, { fresh: indexFresh });
      const data = res?.data ?? res;

      const cleanError = (val) => {
        if (typeof val !== 'string') return 'Index request failed';
        const looksLikeHtml = /<[^>]+>/.test(val);
        return looksLikeHtml ? 'Index request failed' : val;
      };

      if (data?.ok || (res?.status && res.status >= 200 && res.status < 300)) {
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
    } catch (error) {
      console.error('Index agent error:', error);
      message.error('Failed to index agent');
    } finally {
      clearInterval(tick);
      setIndexing(false);
      setTimeout(() => setIndexProgress(0), 600);
    }
  };

  const indexLabel = indexFresh ? 'Index with fresh=true' : 'Index without fresh';


  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center', background: colorBgContainer, paddingRight: 16 }} className='!pl-4' >
        <Button
          type="default"
          onClick={() => {window.location = `/home`}}
          size='large' 
          style={{
            fontSize: '16px',
            padding: '0 5px',
          }}
          className='!bg-gray-200 rounded-lg mr-4'
        >
          <img src="/assets/logo/favicon.png" alt="icon" style={{ width: 30, verticalAlign: 'middle' }} />
        </Button>

        <div className="demo-logo font-semibold text-2xl">
          {loading ? 'Loading...' : (agent?.agent_name || 'Agent name')}
        </div>

        <div className='ml-auto'>
          <Button type="primary" onClick={() => { setIndexModalOpen(true) }}>Index Agent</Button>
          <UserMenu />
        </div>
      </Header>
      <Layout>
        <Sider width={250} style={{ background: "#000B41" }} trigger={null} collapsible collapsed={collapsed}>
          <Menu
            className='my-app-menu !mt-6 '
            mode="inline"
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            style={{ height: '100%', borderInlineEnd: 0, background: "#000B41"  }}
            items={[
              { key: '1', icon: <LayoutDashboard />, label: <Link to={`/${id}/dashboard`}>Dashboard</Link> },
              { key: '2', icon: <Settings />, label: 'Agent Settings',
                children: [
                  { key: 'agent-ifo', label: ( <Link to={`/${id}/dashboard/agent-info`}> Agent Info </Link> ), },
                  { key: 'chat-widget', label: ( <Link to={`/${id}/dashboard/chat-widget`}> Chat Widget </Link> ), },
                  { key: 'feature-config', label: ( <Link to={`/${id}/dashboard/features`}> Feature Config </Link> ), },
                  { key: 'facebook-integrations', label: <Link to={`/${id}/dashboard/facebook`}>Facebook Integrations</Link> },
                  { key: 'instagram-integrations', label: <Link to={`/${id}/dashboard/instagram`}>Instagram Integrations</Link> },
                  { key: 'whatsapp-integrations', label: <Link to={`/${id}/dashboard/whatsapp`}>WhatsApp Integrations</Link> },
                  { key: 'website-integrations', label: <Link to={`/${id}/dashboard/website`}>Website (WordPress)</Link> },
                  { key: 'woocommerce-integrations', label: <Link to={`/${id}/dashboard/woocommerce`}>WooCommerce</Link> },
                ],
              },
              
              
              
              { key: '3', icon: <SquareChartGantt />, label: <Link to={`/${id}/dashboard/manage-prompts`}>Manage Prompts</Link> },
              { key: '4', icon: <Files />, label: <Link to={`/${id}/dashboard/manage-files`}>Manage Documents</Link> },
              
              { key: '5', icon: <Lightbulb />, label: <Link to={`/${id}/dashboard/knowledge`}>Knowledge</Link> },
              
              { key: '6', icon: <Users />, label: <Link to={`/${id}/dashboard/customers`}>Customers</Link> },
              // { key: '7', icon: <MessageCircleReply />, label: <Link to={`/${id}/dashboard/chat-history`}>Chat History</Link> },
              
              { key: '8', icon: <User />, label: <Link to={`/${id}/dashboard/leads`}>Manage Leads</Link> },
              
              {
                key: 'bookings',
                icon: <Calendar />,
                label: 'Bookings',
                children: [
                  {
                    key: 'bookings-list',
                    label: <Link to={`/${id}/dashboard/bookings`}>Manage Bookings</Link>,
                  },
                  {
                    key: 'booking-windows',
                    label: <Link to={`/${id}/dashboard/booking-windows`}>Booking Windows</Link>,
                  },
                ],
              },

              { key: 'complaints', icon: <ClipboardMinus />, label: <Link to={`/${id}/dashboard/complaints`}>Complaints</Link> },
              

              { key: '11', icon: <ShoppingBag />, label: 'Commerce',
                children: [
                  { key: 'products', label: <Link to={`/${id}/dashboard/products`}>Products</Link> },
                  { key: 'orders', label: <Link to={`/${id}/dashboard/orders`}>Orders</Link> },
                  { key: 'offers', label: <Link to={`/${id}/dashboard/offers`}>Offers</Link> },
                ],
              },

              { key: '12', icon: <ClipboardMinus />, label: <Link to={`/${id}/dashboard/report`}>Reports</Link> },
            ]}
          />
        </Sider>
        <Layout style={{ padding: '24px 24px' }}>
          <Content
            style={{
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
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
              <Text type="secondary" className="text-xs uppercase tracking-wide">{indexLabel}</Text>
            </div>
            <Progress percent={indexProgress} status={indexing ? 'active' : undefined} />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
