import {
  AppstoreAddOutlined,
  AppstoreOutlined,
  HomeOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import Cookies from 'js-cookie';
import { ClipboardMinus, Files, LayoutDashboard, Lightbulb, Settings, SquareChartGantt, Users } from 'lucide-react';
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
              { key: '2', icon: <Settings />, label: 'Agent Settings',
                children: [
                  { key: 'settings-general', label: ( <Link to={`/${id}/dashboard/agent-general`}> General Info </Link> ), },
                  { key: 'settings-widget', label: ( <Link to={`/${id}/dashboard/agent-settings`}> Chat Widget </Link> ), },
                  { key: 'settings-channels', label: ( <Link to={`/${id}/dashboard/agent-configuration`}> Config Features </Link> ), },
                ],
              },
              
              
              
              { key: '3', icon: <SquareChartGantt />, label: <Link to={`/${id}/dashboard/manage-prompts`}>Manage Prompts</Link> },
              { key: '4', icon: <Files />, label: <Link to={`/${id}/dashboard/manage-files`}>Manage Documents</Link> },
              
              { key: '5', icon: <Lightbulb />, label: <Link to={`/${id}/dashboard/knowledge`}>Knowledge</Link> },
              
              { key: '6', icon: <Users />, label: <Link to={`/${id}/dashboard/customers`}>Customers</Link> },
              // { key: '7', icon: <MessageCircleReply />, label: <Link to={`/${id}/dashboard/chat-history`}>Chat History</Link> },
              
              { key: '8', icon: <Users />, label: <Link to={`/${id}/dashboard/leads`}>Manage Leads</Link> },
              
              { key: '9', icon: <Settings />, label: 'Bookings',
                children: [
                  { key: 'settings-general', label: ( <Link to={`/${id}/dashboard/agent-general`}> Manage Bookings </Link> ), },
                  { key: 'settings-widget', label: ( <Link to={`/${id}/dashboard/agent-settings`}> Booking Windows </Link> ), },
                ],
              },

              { key: '10', icon: <Users />, label: <Link to={`/${id}/dashboard/customers`}>Manage Complaints</Link> },
              

              { key: '11', icon: <Settings />, label: 'Product & Orders',
                children: [
                  { key: 'settings-general', label: ( <Link to={`/${id}/dashboard/agent-general`}> Manage Products </Link> ), },
                  { key: 'settings-widget', label: ( <Link to={`/${id}/dashboard/agent-settings`}> Manage Orders </Link> ), },
                  { key: 'settings-channels', label: ( <Link to={`/${id}/dashboard/agent-configuration`}> Manage Offers </Link> ), },
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