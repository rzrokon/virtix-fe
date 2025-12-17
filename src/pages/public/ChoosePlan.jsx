import { useEffect, useMemo, useState } from 'react';
import { Button, message, Spin } from 'antd';
import Cookies from 'js-cookie';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getData, postData } from '../../scripts/api-service';
import { GET_BILLING_PLANS, START_SUBSCRIPTION } from '../../scripts/api';

const priceLabel = (plan) => {
  if (plan.contact_sales_only) return 'Contact sales';
  const p = parseFloat(plan.price_usd);
  if (!p || p === 0) return 'Free';
  return `$${p}`;
};

export default function ChoosePlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null);
  const navigate = useNavigate();

  const publicPlans = useMemo(() => {
    return (Array.isArray(plans) ? plans : [])
      .filter(p => p.is_public)
      .sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [plans]);

  useEffect(() => {
    const token = Cookies.get('kotha_token');
    console.log('[ChoosePlan] token exists?', !!token);

    if (!token) {
      window.location.href = '/signin';
      return;
    }

    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await getData(GET_BILLING_PLANS, true);
        const list = Array.isArray(res) ? res : (res?.results || []);
        setPlans(list);
      } catch (e) {
        console.error('[ChoosePlan] fetch plans failed', e);
        message.error('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const startPlan = async (plan) => {
    if (plan.contact_sales_only) {
      message.info('Please contact sales for Enterprise plan.');
      return;
    }

    setStarting(plan.code);

    try {
      const payload = { plan_code: plan.code };
      console.log('[StartSubscription] payload', payload);

      const res = await postData(START_SUBSCRIPTION, payload);
      const data = res?.data ?? res;

      console.log('[StartSubscription] response', data);

      // ✅ Paid plan => Lemon checkout
      if (data?.detail === 'checkout_created' && data?.mode === 'lemon_checkout' && data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      // ✅ Free/internal => activate and go home
      if (data?.detail === 'ok') {
        message.success('Plan activated successfully!');
        navigate('/home', { replace: true });
        return;
      }

      message.error('Unexpected subscription response');
    } catch (e) {
      console.error('[StartSubscription] exception', e);
      message.error('Failed to start subscription');
    } finally {
      setStarting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spin />
      </div>
    );
  }

  return (
    <section className="pricing py-20 min-h-screen">
      <div className="container growth-content flex flex-col items-center justify-center gap-8">
        <div className="md:w-3xl space-y-4 text-center">
          <h2 className="text-6xl leading-[120%] text-[#0C0900] font-bold">Choose your plan</h2>
          <p className="font-normal text-base leading-[140%] text-[#0C0900]">
            You need an active plan to access the dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {publicPlans.map((plan) => {
            const popular = plan.code === 'business';

            const features = [
              `Up to ${plan.max_agents} agent${plan.max_agents > 1 ? 's' : ''}`,
              `${plan.max_files} files`,
              `${Number(plan.max_messages_per_month || 0).toLocaleString()} messages/month`,
              plan.lead_gen ? 'Lead generation' : null,
              plan.booking ? 'Booking system' : null,
              plan.complaints ? 'Complaints management' : null,
              plan.products_orders ? 'Products & orders' : null,
              plan.offers ? 'Offers & promotions' : null,
            ].filter(Boolean);

            return (
              <div
                key={plan.id}
                className={`relative rounded-[20px] p-8 transition-all duration-300 hover:shadow-lg ${
                  popular
                    ? 'bg-[#F4EDFF] border-2 border-[#6200FF] transform scale-105'
                    : 'bg-[linear-gradient(172.42deg,#FFFFFF_4.56%,#E7D7FF_50.03%,#FFFFFF_95.51%)] border border-[#ECECEC]'
                }`}
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl leading-[140%] text-[#0C0900] font-bold">{plan.name}</h3>
                    <div className="plan-price">
                      <span className="text-4xl leading-[140%] text-[#0C0900] font-bold">
                        {priceLabel(plan)}
                      </span>
                      {parseFloat(plan.price_usd) > 0 ? (
                        <p className="text-lg text-gray-600 ml-1">/month</p>
                      ) : null}
                    </div>
                  </div>

                  <Button
                    type={popular ? 'primary' : ''}
                    size="large"
                    loading={starting === plan.code}
                    onClick={() => startPlan(plan)}
                    className={`w-full h-12 font-semibold ${
                      popular ? 'bg-[#6200FF] border-[#6200FF] hover:bg-[#5000CC]' : ''
                    }`}
                  >
                    {starting === plan.code ? 'Processing...' : (parseFloat(plan.price_usd) > 0 ? 'Continue to payment' : 'Activate Free')}
                  </Button>

                  <div className="plan-features space-y-3">
                    <h4 className="font-semibold text-[#0C0900] text-lg mb-4">What's included:</h4>
                    {features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-[#0C0900] text-sm leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}