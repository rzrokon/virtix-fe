import { useEffect, useState } from 'react';
import { Button, Card, Spin, message } from 'antd';
import { CheckCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getData } from '../../scripts/api-service';
import { GET_MY_SUBSCRIPTION } from '../../scripts/api';

export default function BillingSuccess() {
  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState(null);
  const [status, setStatus] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const verifySubscription = async () => {
    const token = Cookies.get('kotha_token');

    // If user came back but isn't logged in on this browser, send to signin.
    if (!token) {
      message.warning('Please sign in to continue.');
      navigate('/signin', { replace: true });
      return;
    }

    setLoading(true);
    try {
      const sub = await getData(GET_MY_SUBSCRIPTION);
      const code = sub?.subscription?.plan?.code;
      const name = sub?.subscription?.plan?.name;
      const subStatus = sub?.subscription?.status;

      setPlanName(name || code || null);
      setStatus(subStatus || null);

      // ✅ if subscription is active and plan exists -> go home
      if (code && subStatus === 'active') {
        message.success('Subscription activated!');
        navigate('/home', { replace: true });
        return;
      }

      // If plan exists but status not active yet (webhook delay), keep user here
      // and let them retry.
    } catch (e) {
      console.error('[BillingSuccess] verify failed', e);
      message.error('Could not verify your subscription yet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Optional: Lemon may append params like order_id, checkout_id, etc.
    // You can log them if needed:
    console.log('[BillingSuccess] query params:', Object.fromEntries(searchParams.entries()));

    verifySubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-xl rounded-2xl shadow-xl">
        <div className="flex flex-col items-center text-center gap-4 py-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50">
            <CheckCircle size={34} className="text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>

          <p className="text-gray-600">
            Thanks! We’re confirming your subscription and activating your plan.
          </p>

          {loading ? (
            <div className="flex flex-col items-center gap-3 mt-4">
              <Spin />
              <p className="text-sm text-gray-500">Verifying subscription…</p>
            </div>
          ) : (
            <div className="w-full mt-4 space-y-3">
              <div className="bg-gray-50 rounded-xl p-4 text-left">
                <div className="text-sm text-gray-500">Detected plan</div>
                <div className="text-base font-semibold text-gray-900">
                  {planName || 'Not confirmed yet'}
                </div>

                <div className="mt-2 text-sm text-gray-500">Status</div>
                <div className="text-base font-semibold text-gray-900">
                  {status || 'unknown'}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  If activation takes a moment (webhook delay), click “Check again”.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={verifySubscription}>
                  Check again
                </Button>

                <Button
                  type="primary"
                  className="bg-[#6200FF] border-[#6200FF]"
                  onClick={() => navigate('/home')}
                >
                  Go to Dashboard
                </Button>
              </div>

              <div className="text-center">
                <Button type="link" onClick={() => navigate('/active-plan')}>
                  View Active Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}