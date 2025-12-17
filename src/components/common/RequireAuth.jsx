import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';

export default function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('kotha_token');
    console.log('[RequireAuth] token exists?', !!token);

    if (!token) {
      navigate('/signin', { replace: true });
      return;
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center" style={{ minHeight: 300 }}>
        <Spin />
      </div>
    );
  }

  return children;
}