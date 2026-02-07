import {
  AppstoreAddOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  FacebookOutlined,
  HomeOutlined,
  LeftOutlined,
  ProductFilled,
  RightOutlined,
  RobotFilled,
  RobotOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import Cookies from 'js-cookie';
import { ClipboardMinus, Files, LayoutDashboard, Lightbulb, Settings, SquareChartGantt, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import UserMenu from '../components/common/privateLayout/UserMenu';
import { useContentApi } from '../contexts/ContentApiContext';
import { getAgentById } from '../scripts/api-service';
const { Header, Content, Sider } = Layout;

export default function PrivateLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const token = Cookies.get('kotha_token')
  const { setCurrentAgentName } = useContentApi();

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


  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center', background: colorBgContainer }} className='!pl-4' >
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
              { key: '2', icon: <RobotOutlined />, label: 'Agent Settings',
                children: [
                  { key: 'agent-ifo', label: ( <Link to={`/${id}/dashboard/agent-info`}> Agent Info </Link> ), },
                  { key: 'chat-widget', label: ( <Link to={`/${id}/dashboard/chat-widget`}> Chat Widget </Link> ), },
                  { key: 'feature-config', label: ( <Link to={`/${id}/dashboard/features`}> Feature Config </Link> ), },
                  { key: 'facebook-integrations', label: <Link to={`/${id}/dashboard/facebook`}>Facebook Integrations</Link> },
                  { key: 'instagram-integrations', label: <Link to={`/${id}/dashboard/instagram`}>Instagram Integrations</Link> },
                  { key: 'whatsapp-integrations', label: <Link to={`/${id}/dashboard/whatsapp`}>WhatsApp Integrations</Link> },
                  { key: 'website-integrations', label: <Link to={`/${id}/dashboard/website`}>Website (WordPress)</Link> },
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
                icon: <CalendarOutlined />, // or any icon you like (import from antd or lucide)
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
              

              { key: '11', icon: <ProductFilled />, label: 'Commerce',
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
    </Layout>
  );
}