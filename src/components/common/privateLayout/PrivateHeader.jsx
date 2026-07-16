import { Badge, Button, Skeleton, Tooltip } from 'antd';
import {
  Check,
  DatabaseZap,
  Loader2,
  Menu as MenuIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';

const BUILD_STATES = {
  UP_TO_DATE: 'UP_TO_DATE',
  UPDATE_REQUIRED: 'UPDATE_REQUIRED',
  BUILDING: 'BUILDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

export default function PrivateHeader({
  isMobile,
  loading,
  agentName,
  onMenuOpen,
  onIndexClick,
  buildState = BUILD_STATES.UP_TO_DATE,
  pendingCount = 0,
}) {
  const navigate = useNavigate();

  const isPending = buildState === BUILD_STATES.UPDATE_REQUIRED;
  const isBuilding = buildState === BUILD_STATES.BUILDING;
  const isCompleted = buildState === BUILD_STATES.COMPLETED;
  const isFailed = buildState === BUILD_STATES.FAILED;

  const getButtonStyle = () => {
    if (isBuilding || isCompleted) {
      return {
        backgroundColor: '#6D4AFF',
        borderColor: '#6D4AFF',
        color: '#FFFFFF',
      };
    }

    if (isPending || isFailed) {
      return {
        backgroundColor: '#F59E0B',
        borderColor: '#F59E0B',
        color: '#FFFFFF',
      };
    }

    return {
      backgroundColor: '#FFFFFF',
      borderColor: '#D9D9D9',
      color: '#334155',
    };
  };

  const getTooltipText = () => {
    if (isBuilding) {
      return 'Building AI Knowledge from the latest information.';
    }

    if (isCompleted) {
      return 'AI Knowledge was built successfully.';
    }

    if (isFailed) {
      return 'The previous build failed. Click to try again.';
    }

    if (isPending) {
      return `${pendingCount} pending change${
        pendingCount === 1 ? '' : 's'
      }. Build AI Knowledge to apply them.`;
    }

    return 'AI Knowledge is up to date.';
  };

  const getButtonText = () => {
    if (isBuilding) return 'Building...';
    if (isCompleted) return 'Knowledge Updated';
    if (isFailed) return 'Retry AI Knowledge';

    return 'Build AI Knowledge';
  };

  const getButtonIcon = () => {
    if (isBuilding) {
      return <Loader2 size={15} className="animate-spin" />;
    }

    if (isCompleted) {
      return <Check size={15} />;
    }

    return <DatabaseZap size={15} />;
  };

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
        <img
          src="/assets/logo/favicon.png"
          alt="Virtix"
          className="w-8 h-8 object-contain"
        />
      </button>

      <div className="private-layout__agent-title">
        {loading ? (
          <Skeleton.Input
            active
            size="small"
            style={{ width: 140 }}
          />
        ) : (
          <span className="font-semibold text-lg text-slate-800 truncate">
            {agentName || 'Agent'}
          </span>
        )}
      </div>

      <div className="private-layout__header-actions-wrap ml-auto">
        <div className="private-layout__header-actions">
          <Tooltip title={getTooltipText()}>
            <Badge
              count={isPending ? pendingCount : 0}
              overflowCount={99}
              offset={[-2, 2]}
              styles={{
                indicator: {
                  backgroundColor: '#FFFFFF',
                  color: '#D97706',
                  border: '1px solid #F59E0B',
                  fontWeight: 700,
                },
              }}
            >
              <Button
                icon={getButtonIcon()}
                onClick={onIndexClick}
                disabled={loading || isBuilding}
                style={getButtonStyle()}
              >
                {getButtonText()}
              </Button>
            </Badge>
          </Tooltip>

          <UserMenu />
        </div>
      </div>
    </div>
  );
}