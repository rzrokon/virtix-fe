import { Button, message, Spin } from 'antd';
import Cookies from 'js-cookie';
import { Check, Copy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getData, postData } from '../../scripts/api-service';
import { GET_BILLING_PLANS, GET_MY_SUBSCRIPTION, START_SUBSCRIPTION } from '../../scripts/api';

const toBool = (v) => v === true || v === 'true' || v === 1;

export default function ChoosePlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(null);
  const [billing, setBilling] = useState('monthly');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const publicPlans = useMemo(() => {
    return (Array.isArray(plans) ? plans : [])
      .filter(p => p.is_public)
      .sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [plans]);

  useEffect(() => {
    const cycle = searchParams.get('cycle');
    if (cycle === 'yearly') setBilling('yearly');
  }, [searchParams]);

  useEffect(() => {
    const token = Cookies.get('kotha_token');
    if (!token) {
      navigate('/signin', { replace: true });
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        try {
          const sub = await getData(GET_MY_SUBSCRIPTION);
          if (sub?.subscription?.status === 'active') {
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

  const priceLabel = (plan) => {
    if (plan.contact_sales_only) return 'Contact sales';
    const monthly = parseFloat(plan.price_usd);
    const yearly = parseFloat(plan.price_usd_yearly);
    if (!monthly || monthly === 0) return 'Free';
    if (billing === 'yearly' && yearly > 0) {
      return `$${Math.floor(yearly / 12)}/mo`;
    }
    return `$${monthly}/mo`;
  };

  const yearlyNote = (plan) => {
    const yearly = parseFloat(plan.price_usd_yearly);
    if (billing !== 'yearly' || !yearly) return null;
    return `billed as $${yearly}/year`;
  };

  const savingsBadge = (plan) => {
    const monthly = parseFloat(plan.price_usd);
    const yearly = parseFloat(plan.price_usd_yearly);
    if (!monthly || !yearly || billing !== 'yearly') return null;
    const saved = Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
    return saved > 0 ? `Save ${saved}%` : null;
  };

  const startPlan = async (plan) => {
    if (plan.contact_sales_only) {
      navigate('/contact');
      return;
    }

    const isPaid = parseFloat(plan.price_usd) > 0;
    const cycle = isPaid ? billing : 'monthly';

    setStarting(plan.code);
    try {
      const res = await postData(START_SUBSCRIPTION, {
        plan_code: plan.code,
        billing_cycle: cycle,
        provider: 'stripe',
      });
      const data = res?.data ?? res;

      if (data?.error) {
        const errMsg = typeof data.errors === 'string'
          ? data.errors
          : Object.values(data.errors || {}).flat().join(' ') || 'Subscription failed';
        message.error(errMsg);
        return;
      }

      if (data?.detail === 'checkout_created' && data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      if (data?.detail === 'ok') {
        message.success('Plan activated successfully!');
        navigate('/dashboard', { replace: true });
        return;
      }

      message.error('Unexpected response. Please try again.');
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

        {/* Billing cycle toggle */}
        <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
          <button
            onClick={() => setBilling('monthly')}
            className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-all ${
              billing === 'monthly'
                ? 'bg-white text-[#0C0900] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-semibold transition-all ${
              billing === 'yearly'
                ? 'bg-white text-[#0C0900] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Yearly
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
              Save 10%
            </span>
          </button>
        </div>

        {/* Founder offer banner */}
        <div className="w-full max-w-2xl rounded-2xl border border-[#6200FF]/20 bg-[linear-gradient(135deg,#faf5ff_0%,#ede5ff_100%)] px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 space-y-2">
              <p className="text-lg font-bold text-[#0C0900]">🚀 Founding Customer Program</p>
              <p className="text-sm text-[#0C0900]/70">Join the first 100 stores and get 50% off for your first 12 months.</p>
              <p className="text-sm text-[#0C0900]/55">Includes priority support, roadmap influence, and early access to new features.</p>
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('FOUNDER50');
                  message.success('Coupon code copied!');
                }}
                className="flex items-center gap-2 rounded-xl border-2 border-dashed border-[#6200FF]/40 bg-white px-4 py-2.5 hover:border-[#6200FF] transition-colors group"
              >
                <span className="font-mono text-lg font-bold text-[#6200FF] tracking-wider">FOUNDER50</span>
                <Copy size={14} className="text-[#6200FF]/50 group-hover:text-[#6200FF] transition-colors" />
              </button>
              <span className="text-[10px] font-semibold text-[#6200FF]/60 uppercase tracking-wide">Only 100 founder accounts available</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
          {publicPlans.map((plan) => {
            const popular = plan.code === 'growth';
            const badge = savingsBadge(plan);
            const note = yearlyNote(plan);

            const features = [
              `Up to ${plan.max_agents} agent${plan.max_agents > 1 ? 's' : ''}`,
              `Ideal for stores handling up to ${Math.floor((plan.max_messages_per_month || 0) / 4).toLocaleString()} customer inquiries/month`,
              `${plan.max_files} files`,
              toBool(plan.website_widget) ? 'Website Widget' : null,
              toBool(plan.messenger) ? 'Facebook Messenger' : null,
              toBool(plan.instagram) ? 'Instagram' : null,
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
                    {(() => {
                      const monthly = parseFloat(plan.price_usd);
                      const yearly = parseFloat(plan.price_usd_yearly);
                      const isPaid = monthly > 0 && !plan.contact_sales_only;
                      const rawPrice = billing === 'yearly' && yearly > 0 ? yearly / 12 : monthly;
                      const founderPrice = isPaid ? (rawPrice / 2) : 0;
                      const founderLabel = founderPrice % 1 === 0 ? `$${founderPrice}` : `$${founderPrice.toFixed(2)}`;
                      return (
                        <>
                          <div className="flex items-end gap-2 flex-wrap">
                            <span className="text-4xl leading-[140%] text-[#0C0900] font-bold">
                              {priceLabel(plan)}
                            </span>
                            {badge && (
                              <span className="mb-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                {badge}
                              </span>
                            )}
                          </div>
                          {isPaid && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xl leading-[140%] text-[#6200FF] font-bold">
                                {founderLabel}/mo
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#6200FF]/10 text-[#6200FF]">
                                Founder Price
                              </span>
                            </div>
                          )}
                          {billing === 'yearly' && yearly > 0 && isPaid ? (
                            <p className="text-xs text-gray-400">
                              <span className="line-through">${yearly}/yr</span>
                              {' '}
                              <span className="text-[#6200FF]/70">
                                ${(yearly / 2) % 1 === 0 ? yearly / 2 : (yearly / 2).toFixed(2)}/yr with FOUNDER50
                              </span>
                            </p>
                          ) : note ? (
                            <p className="text-xs text-gray-400">{note}</p>
                          ) : null}
                        </>
                      );
                    })()}
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
                    <h4 className="font-semibold text-[#0C0900]">What&apos;s included</h4>
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
