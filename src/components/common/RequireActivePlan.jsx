import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getData } from '../../scripts/api-service';
import { GET_MY_SUBSCRIPTION } from '../../scripts/api';

export default function RequireActivePlan({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const run = async () => {
      const token = Cookies.get('kotha_token');

      if (!token) {
        navigate('/signin', { replace: true });
        return;
      }

      try {
        const data = await getData(GET_MY_SUBSCRIPTION);

        const planCode = data?.subscription?.plan?.code;

        if (!planCode) {
          navigate('/choose-plan', { replace: true, state: { from: location.pathname } });
          return;
        }

        setLoading(false);
      } catch {
        navigate('/choose-plan', { replace: true, state: { from: location.pathname } });
      }
    };

    run();
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center" style={{ minHeight: 300 }}>
        <Spin />
      </div>
    );
  }

  return children;
}