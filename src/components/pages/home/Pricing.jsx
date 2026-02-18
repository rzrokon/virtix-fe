import { Button, message } from 'antd';
import Cookies from 'js-cookie';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET_BILLING_PLANS, START_SUBSCRIPTION } from '../../../scripts/api';
import { getData, postData } from '../../../scripts/api-service';

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const navigate = useNavigate();

  // Fetch billing plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);

        // ✅ Plans endpoint is public → pass no_token = true
        const response = await getData(GET_BILLING_PLANS, true);

        // ✅ API returns an array (your backend example), but keep compatibility:
        const list = Array.isArray(response)
          ? response
          : (response?.results || []);

        // ✅ show only public plans (optional but safe)
        const publicPlans = list.filter(p => p.is_public);

        // ✅ keep stable ordering (starter, business, enterprise)
        publicPlans.sort((a, b) => (a.id || 0) - (b.id || 0));

        setPlans(publicPlans);
        setError(null);
      } catch (error) {
        console.error('Error fetching billing plans:', error);
        setError('Failed to load pricing plans');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Format price for display
  const formatPrice = (plan, cycle) => {
    // Enterprise may be "Contact Sales" even if 0.00
    if (plan.contact_sales_only) return 'Contact sales';

    const price = parseFloat(plan.price_usd);
    if (!price || price === 0) return 'Free';
    const displayPrice = cycle === 'annual' ?  (price * 12 * 0.9).toFixed(0) : price;
    return `$${displayPrice}`;
  };

  // should show "/month" label?
  const showPerMonth = (plan, cycle) => {
    if (plan.contact_sales_only) return false;
    const price = parseFloat(plan.price_usd);
    return price > 0;
  };

  const getPlanSummary = (plan) => {
    if (plan.contact_sales_only) return 'Custom scale, integrations, and controls.';
    const price = parseFloat(plan.price_usd);
    if (!price || price === 0) return 'Perfect to get started.';
    if (plan.code === 'business') return 'For growing teams ready to automate.';
    return null;
  };

  // Format number with commas
  const formatNumber = (num) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num?.toString?.() ?? '0';
  };

  // Format bytes to readable format
  const formatBytes = (bytes) => {
    if (bytes >= 1000000000000) return `${(bytes / 1000000000000).toFixed(1)}TB`;
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(1)}GB`;
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)}MB`;
    return `${(bytes / 1000).toFixed(0)}KB`;
  };

  // Get features list for each plan
  const getPlanFeatures = (plan) => {
    const features = [
      `Up to ${formatNumber(plan.max_agents)} agent${plan.max_agents > 1 ? 's' : ''}`,
      `${formatNumber(plan.max_files)} files`,
      `${formatNumber(plan.max_messages_per_month)} messages/month`,
      `${formatBytes(plan.max_storage_bytes)} storage`,
      `${formatBytes(plan.max_index_bytes)} index capacity`,
    ];

    const featureItems = [
      { key: 'lead_gen', label: 'Lead Generation' },
      { key: 'booking', label: 'Booking System' },
      { key: 'complaints', label: 'Complaints Management' },
      { key: 'products_orders', label: 'Products & Orders' },
      { key: 'offers', label: 'Special Offers' },
    ];

    featureItems.forEach(item => {
      features.push({
        text: item.label,
        included: !!plan[item.key]
      });
    });

    return features;
  };

  // Determine if plan is popular (Business plan)
  const isPopular = (plan) => plan.code === 'business';

  // Handle plan selection with authentication check
  const handlePlanSelection = async (plan) => {
    const token = Cookies.get('kotha_token');

    // Check if user is authenticated
    if (!token) {
      navigate('/signin');
      return;
    }

    // For contact sales plans, handle differently
    if (plan.contact_sales_only) {
      message.info('Please contact our sales team for enterprise plans.');
      return;
    }

    try {
      setSubscriptionLoading(plan.id);

      // NOTE: if your subscription endpoint is protected and sometimes logs out,
      // you’ll want to debug postData/checkRes. For now, keeping your logic.
      const response = await postData(START_SUBSCRIPTION, {
        plan_code: plan.code
      });

      if (response?.error) {
        console.error('Subscription API returned error:', response.errors);
        message.error('Failed to start subscription. Please try again.');
        return;
      }

      if (response) {
        message.success(`Successfully subscribed to ${plan.name} plan!`);
        navigate('/');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      message.error('Failed to start subscription. Please try again.');
    } finally {
      setSubscriptionLoading(null);
    }
  };

  // --- your loading/error UI stays unchanged ---
  if (loading) {
    return (
      <section className="pricing py-20">
        <div className="container growth-content flex flex-col items-center justify-center gap-8">
          <div className="md:w-3xl space-y-4">
            <h2 className="text-6xl leading-[120%] text-[#0C0900] font-bold text-center">Simple, scalable pricing</h2>
            <p className="font-normal text-base leading-[140%] text-[#0C0900] text-center">
              Loading pricing plans...
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="rounded-[20px] p-6 bg-gray-200 animate-pulse">
                <div className="space-y-2">
                  <div className="h-6 bg-gray-300 rounded"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
                <div className="mt-6 space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pricing py-20">
        <div className="container growth-content flex flex-col items-center justify-center gap-8">
          <div className="md:w-3xl space-y-4">
            <h2 className="text-6xl leading-[120%] text-[#0C0900] font-bold text-center">Predictable pricing scalable plans</h2>
            <p className="font-normal text-base leading-[140%] text-red-600 text-center">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pricing py-20">
      <div className="container flex flex-col gap-10">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-4xl md:text-5xl leading-[120%] text-[#0C0900] font-bold">
              Simple, scalable pricing
            </h2>
            <p className="font-normal text-base leading-[150%] text-[#0C0900]">
              No credit card required to start.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-sm font-semibold rounded-full ${billingCycle === 'monthly'
                ? 'bg-[#0C0900] text-white'
                : 'text-gray-500 hover:text-[#0C0900]'
                }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 text-sm font-semibold rounded-full ${billingCycle === 'annual'
                ? 'bg-[#000b41] text-white'
                : 'text-gray-500 hover:text-[#0C0900]'
                }`}
            >
              Annual
            </button>
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500">
            {billingCycle === 'annual' ? 'Annual plans' : 'Monthly plans'}
          </div>
          {billingCycle === 'annual' ? (
            <div className="text-xs text-[#0C0900] font-semibold">
              Save 10% with annual billing
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={plan.id || index}
              className={`relative rounded-3xl border p-7 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-1 ${isPopular(plan)
                ? 'bg-[#000b41] border-[#0C0900] text-white'
                : 'bg-white border-[#E5E7EB]'
                }`}
            >
              {isPopular(plan) && (
                <div className="absolute -top-3 left-6 rounded-full bg-[#6200FF] px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className={`text-2xl leading-[140%] font-bold ${isPopular(plan) ? 'text-white' : 'text-[#0C0900]'}`}>
                    {plan.name}
                  </h3>
                  {getPlanSummary(plan) ? (
                    <p className={`text-sm ${isPopular(plan) ? 'text-white/70' : 'text-[#0C0900]/70'}`}>
                      {getPlanSummary(plan)}
                    </p>
                  ) : null}
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl leading-[140%] font-bold ${isPopular(plan) ? 'text-white' : 'text-[#0C0900]'}`}>
                      {formatPrice(plan, billingCycle)}
                    </span>
                    {showPerMonth(plan, billingCycle) && (
                      <span className={`leading-[250%] ${isPopular(plan) ? 'text-white/60' : 'text-gray-500'}`}>
                        {billingCycle === 'annual' ? '/year' : '/month'}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  type={isPopular(plan) ? "primary" : ''}
                  size="large"
                  loading={subscriptionLoading === plan.id}
                  onClick={() => handlePlanSelection(plan)}
                  className={`w-full h-12 font-semibold ${isPopular(plan)
                    ? 'bg-[#6200FF] border-[#6200FF] hover:bg-[#5000CC]'
                    : ''
                    }`}
                >
                  {subscriptionLoading === plan.id
                    ? 'Processing...'
                    : plan.contact_sales_only
                      ? 'Contact sales'
                      : 'Get started'}
                </Button>

                <div className="space-y-3">
                  <div className={`text-xs uppercase tracking-[0.3em] ${isPopular(plan) ? 'text-white/50' : 'text-gray-500'}`}>
                    What's included
                  </div>
                  {getPlanFeatures(plan).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      {typeof feature === 'string' ? (
                        <>
                          <Check size={18} className={`${isPopular(plan) ? 'text-[#62F5A8]' : 'text-green-600'} mt-0.5 flex-shrink-0`} />
                          <span className={`${isPopular(plan) ? 'text-white/85' : 'text-[#0C0900]'} text-sm leading-relaxed`}>
                            {feature}
                          </span>
                        </>
                      ) : (
                        <>
                          {feature.included ? (
                            <Check size={18} className={`${isPopular(plan) ? 'text-[#62F5A8]' : 'text-green-600'} mt-0.5 flex-shrink-0`} />
                          ) : (
                            <X size={18} className={`${isPopular(plan) ? 'text-white/40' : 'text-gray-400'} mt-0.5 flex-shrink-0`} />
                          )}
                          <span className={`text-sm leading-relaxed ${feature.included
                            ? (isPopular(plan) ? 'text-white/85' : 'text-[#0C0900]')
                            : (isPopular(plan) ? 'text-white/45' : 'text-gray-400')
                            }`}>
                            {feature.text}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
