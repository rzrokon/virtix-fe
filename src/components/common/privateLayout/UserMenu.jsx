import { DownOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, message, Space } from "antd";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { logoutUser } from '../../../scripts/api-service';

export default function UserMenu() {
  const navigate = useNavigate();
  const { user, isAuthenticated, clearUser } = useUser();

  const items = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => {
        window.location = `/profile`
      }
    },
    {
      key: 'create-agent',
      icon: <SettingOutlined />,
      label: 'Create Agent',
      onClick: () => {
        window.location = `/create-agent`
      }
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];


  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'dashboard') {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      message.loading('Logging out...', 0.5);
      await logoutUser();
      clearUser(); // Clear user context on logout
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Logout failed. Please try again.');
    }
  };

  return (
    <>
      <Dropdown
        menu={{
          items,
          onClick: handleMenuClick
        }}
        placement="bottomRight"
        arrow
      >
        <Button type="text" className="flex items-center">
          <Space>
            <Avatar
              size="large"
              shape="square"
              src={user?.profileImageUrl}
              icon={!user?.profileImageUrl ? <UserOutlined /> : null}
            />
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
    </>
  )
}
