import { DashboardOutlined, DownOutlined, LockOutlined, LogoutOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, message, Space } from "antd";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { logoutUser } from '../../../scripts/api-service';

export default function UserMenu() {
  const navigate = useNavigate();
  const { user, clearUser } = useUser();

  const items = [
    {
      key: 'create-agent',
      icon: <RobotOutlined />,
      label: 'My Agents',
    },
    {
      key: 'active-plan',
      icon: <DashboardOutlined />,
      label: 'Active Plan',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Edit Profile',
    },
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Change Password',
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
    } else if (key === 'create-agent') {
      navigate('/home');
    } else if (key === 'active-plan') {
      navigate('/active-plan');
    } else if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'change-password') {
      navigate('/change-password');
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
        <Button type="text" style={{ paddingRight: 0 }} className="flex items-center user-menu">
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
