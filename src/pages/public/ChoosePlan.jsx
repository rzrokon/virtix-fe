import { Button, message, Spin } from 'antd';
import Cookies from 'js-cookie';
import { Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getData, postData } from '../../scripts/api-service';
import { GET_BILLING_PLANS, GET_MY_SUBSCRIPTION, START_SUBSCRIPTION } from '../../scripts/api';

const toBool = (v) => v === true || v === 'true' || v === 1;

const priceLabel = (plan) => {
  if (plan.contact_sales_only) return 'Contact sales';
  const p = parseFloat(plan.price_usd);
  if (!p || p === 0) return 'Free';
  return `$${p}`;
};

export default function ChoosePlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(null);
  const navigate = useNavigate();

  const publicPlans = useMemo(() => {
    return (Array.isArray(plans) ? plans : [])
      .filter(p => p.is_public)
      .sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [plans]);

  useEffect(() => {
    const token = Cookies.get('kotha_token');
    if (!token) {
      navigate('/signin', { replace: true });
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        // Redirect to home if user already has an active plan
        try {
          const sub = await getData(GET_MY_SUBSCRIPTION);
          if (sub?.is_active) {
            navigate('/dashboard', { replace: true });
            return;
          }
        } catch {
          // No subscription or error — continue to plan selection
        }

        const res = await getData(GET_BILLING_PLANS, true);
        const list = Array.isArray(res) ? res : (res?.results || []);
        setPlans(list);
      } catch {
        setError('Failed to load plans. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  const startPlan = async (plan) => {
    if (plan.contact_sales_only) {
      navigate('/contact');
      return;
    }

    setStarting(plan.code);
    try {
      const res = await postData(START_SUBSCRIPTION, { plan_code: plan.code });
      const data = res?.data ?? res;

      // API-level error returned by postData
      if (data?.error) {
        const errMsg = typeof data.errors === 'string'
          ? data.errors
          : Object.values(data.errors || {}).flat().join(' ') || 'Subscription failed';
        message.error(errMsg);
        return;
      }

      // Paid plan → Lemon Squeezy checkout
      if (data?.detail === 'checkout_created' && data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      // Free / internal plan activated
      if (data?.detail === 'ok') {
        message.success('Plan activated successfully!');
        navigate('/dashboard', { replace: true });
        return;
      }

      message.error('Unexpected response. Please try again.');
    } catch {
      message.error('Failed to start subscription. Please try again.');
    } finally {
      setStarting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 px-4">
        <p className="text-red-500 text-center">{error}</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  return (
    <section className="pricing py-20 min-h-screen">
      <div className="container flex flex-col items-center justify-center gap-8">

        <div className="max-w-3xl space-y-3 text-center px-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl leading-[120%] text-[#0C0900] font-bold">
            Choose your plan
          </h2>
          <p className="font-normal text-base leading-[140%] text-gray-500">
            You need an active plan to access the dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
          {publicPlans.map((plan) => {
            const popular = plan.code === 'growth';

            const features = [
              `Up to ${plan.max_agents} agent${plan.max_agents > 1 ? 's' : ''}`,
              `${Number(plan.max_messages_per_month || 0).toLocaleString()} messages/month`,
              `${plan.max_files} files`,
              `${plan.max_team_members} team member${plan.max_team_members > 1 ? 's' : ''}`,
              toBool(plan.website_widget) ? 'Website Widget' : null,
              toBool(plan.messenger) ? 'Facebook Messenger' : null,
              toBool(plan.instagram) ? 'Instagram' : null,
              toBool(plan.whatsapp) ? 'WhatsApp' : null,
              toBool(plan.booking) ? 'Booking System' : null,
              toBool(plan.complaints) ? 'Complaints Management' : null,
              toBool(plan.website_data) ? 'Website Data' : null,
              toBool(plan.wordpress_data) ? 'WordPress Data' : null,
              toBool(plan.internal_commerce) ? 'Internal Commerce' : null,
              toBool(plan.woocommerce) ? 'WooCommerce' : null,
              toBool(plan.shopify) ? 'Shopify' : null,
              toBool(plan.product_recommendations) ? 'Product Recommendations' : null,
              toBool(plan.order_processing) ? 'Order Processing' : null,
              toBool(plan.order_tracking) ? 'Order Tracking' : null,
              toBool(plan.analytics) ? 'Analytics' : null,
            ].filter(Boolean);

            return (
              <div
                key={plan.id}
                className={`relative rounded-[20px] p-8 transition-all duration-300 hover:shadow-lg ${
                  popular
                    ? 'bg-[#F4EDFF] border-2 border-[#6200FF] md:scale-105'
                    : 'bg-[linear-gradient(172.42deg,#FFFFFF_4.56%,#E7D7FF_50.03%,#FFFFFF_95.51%)] border border-[#ECECEC]'
                }`}
              >
                {popular && (
                  <div className="absolute -top-3.5 left-6 rounded-full bg-[#6200FF] px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl leading-[140%] text-[#0C0900] font-bold">{plan.name}</h3>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl leading-[140%] text-[#0C0900] font-bold">
                        {priceLabel(plan)}
                      </span>
                      {!plan.contact_sales_only && parseFloat(plan.price_usd) > 0 && (
                        <span className="text-base text-gray-500 pb-1">/month</span>
                      )}
                    </div>
                  </div>

                  <Button
                    type={popular ? 'primary' : 'default'}
                    size="large"
                    loading={starting === plan.code}
                    onClick={() => startPlan(plan)}
                    className={`w-full h-12 font-semibold ${
                      popular ? 'bg-[#6200FF] border-[#6200FF] hover:bg-[#5000CC]' : ''
                    }`}
                  >
                    {starting === plan.code
                      ? 'Processing...'
                      : plan.contact_sales_only
                        ? 'Contact sales'
                        : parseFloat(plan.price_usd) > 0
                          ? 'Continue to payment'
                          : 'Activate Free'}
                  </Button>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-[#0C0900]">What's included</h4>
                    {features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check size={16} className="text-[#6200FF] mt-0.5 flex-shrink-0" />
                        <span className="text-[#0C0900] text-sm leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-gray-400 text-center px-4">
          Need a custom plan?{' '}
          <a href="/contact" className="text-[#6200FF] hover:underline font-medium">
            Contact our support team
          </a>.
        </p>
      </div>
    </section>
  );
}
