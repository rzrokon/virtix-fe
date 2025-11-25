import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';

export default function AuthHeader() {
  const { user, isAuthenticated } = useUser();

  return (
    <header className="bg-white shadow-sm border-b border-[#ECECEC] fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link to="/">
                <img
                  src="/assets/logo/Logo.svg"
                  alt="VIRTIS AI"
                  className="h-8 w-auto"
                />
              </Link>
            </div>
          </div>


          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <Avatar 
                  size={32}
                  src={user.profileImageUrl}
                  icon={!user.profileImageUrl ? <UserOutlined /> : null}
                />
                <span className="text-sm font-medium text-gray-700">
                  {user.first_name} {user.last_name}
                </span>
              </div>
            ) : (
              <Link to="/signin">
                <Button type="primary">Create account</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}

      </div>
    </header>
  )
}
