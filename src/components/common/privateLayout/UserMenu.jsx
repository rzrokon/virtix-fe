import { LockOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, message } from 'antd';
import { ChevronDown, CreditCard, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { logoutUser } from '../../../scripts/api-service';

export default function UserMenu() {
  const navigate  = useNavigate();
  const { user, clearUser } = useUser();

  const handleLogout = async () => {
    try {
      message.loading('Logging out...', 0.5);
      await logoutUser();
      clearUser();
    } catch {
      message.error('Logout failed. Please try again.');
    }
  };

  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
    : user?.email || 'Account';

  const items = [
    {
      key: 'user-info',
      label: (
        <div className="px-1 py-1 pointer-events-none">
          <p className="font-semibold text-slate-800 text-sm leading-tight">{displayName}</p>
          {user?.email && (
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{user.email}</p>
          )}
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'agents',
      icon: <LayoutDashboard size={14} />,
      label: 'My Agents',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'active-plan',
      icon: <CreditCard size={14} />,
      label: 'Active Plan',
      onClick: () => navigate('/active-plan'),
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Edit Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Change Password',
      onClick: () => navigate('/change-password'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" arrow trigger={['click']}>
      <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors">
        <Avatar
          size={32}
          shape="circle"
          src={user?.profileImageUrl}
          icon={!user?.profileImageUrl ? <UserOutlined /> : null}
          className="bg-[#6200FF]"
        />
        <ChevronDown size={14} className="text-slate-400" />
      </button>
    </Dropdown>
  );
}
