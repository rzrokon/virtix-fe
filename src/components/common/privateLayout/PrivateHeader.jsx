import { Button, Skeleton } from 'antd';
import { DatabaseZap, Menu as MenuIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';

export default function PrivateHeader({ isMobile, loading, agentName, onMenuOpen, onIndexClick }) {
  const navigate = useNavigate();

  return (
    <div className="private-layout__header-main">
      {isMobile && (
        <Button
          type="text"
          icon={<MenuIcon size={22} />}
          onClick={onMenuOpen}
          aria-label="Open navigation menu"
          className="private-layout__menu-trigger shrink-0"
        />
      )}

      <button
        onClick={() => navigate('/dashboard')}
        className="shrink-0 flex items-center justify-center h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-label="Go to dashboard"
      >
        <img src="/assets/logo/favicon.png" alt="Virtix" className="w-6 h-6 object-contain" />
      </button>

      <div className="private-layout__agent-title">
        {loading ? (
          <Skeleton.Input active size="small" style={{ width: 140 }} />
        ) : (
          <span className="font-semibold text-lg text-slate-800 truncate">
            {agentName || 'Agent'}
          </span>
        )}
      </div>

      <div className="private-layout__header-actions-wrap ml-auto">
        <div className="private-layout__header-actions">
          <Button
            icon={<DatabaseZap size={15} />}
            onClick={onIndexClick}
            disabled={loading}
          >
            Index Agent
          </Button>
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
