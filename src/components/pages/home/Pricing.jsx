import { Button } from 'antd';
import Cookies from 'js-cookie';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET_BILLING_PLANS } from '../../../scripts/api';
import { getData } from '../../../scripts/api-service';

const toBool = (v) => v === true || v === 'true' || v === 1;

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toString();
};

const getPlanCode = (plan) => plan.code?.toLowerCase();

const getPlanDisplayName = (plan) => {
  const names = {
    starter: 'Starter',
    growth: 'Growth',
    business: 'Business',
  };

  return names[getPlanCode(plan)] || plan.name;
};

const getPlanDescription = (plan) => {
  const descriptions = {
    starter: 'For testing Virtix on your store',
    growth: 'For small stores ready to automate support',
    business: 'For growing stores with higher volume',
  };

  return descriptions[getPlanCode(plan)] || 'Flexible AI support for your store';
};

const SectionLabel = ({ children, popular }) => (
  <p className={`text-[10px] uppercase tracking-widest font-semibold mt-5 mb-2 ${popular ? 'text-white/40' : 'text-gray-400'}`}>
    {children}
  </p>
);

const FeatureRow = ({ label, enabled, popular }) => (
  <div className="flex items-center gap-2">
    {enabled ? (
      <Check size={14} className={`flex-shrink-0 ${popular ? 'text-[#62F5A8]' : 'text-green-600'}`} />
    ) : (
      <X size={14} className={`flex-shrink-0 ${popular ? 'text-white/25' : 'text-gray-300'}`} />
    )}
    <span className={`text-sm leading-snug ${
      enabled
        ? (popular ? 'text-white/85' : 'text-[#0C0900]')
        : (popular ? 'text-white/35' : 'text-gray-400')
    }`}>
      {label}
    </span>
  </div>
);

// Accepts optional plans/loading props so a parent page can share one fetch.
// Falls back to internal fetch when props are not provided (e.g. Home page).
const Pricing = ({ plans: plansProp, loading: loadingProp } = {}) => {
  const [internalPlans, setInternalPlans] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const useProp = plansProp !== undefined;
  const plans = useProp ? plansProp : internalPlans;
  const loading = useProp ? loadingProp : internalLoading;

  useEffect(() => {
    if (useProp) return;
    const fetchPlans = async () => {
      try {
        setInternalLoading(true);
        const response = await getData(GET_BILLING_PLANS, true);
        const list = Array.isArray(response) ? response : (response?.results || []);
        const publicPlans = list.filter(p => p.is_public);
        publicPlans.sort((a, b) => (a.id || 0) - (b.id || 0));
        setInternalPlans(publicPlans);
        setError(null);
      } catch {
        setError('Failed to load pricing plans');
        setInternalPlans([]);
      } finally {
        setInternalLoading(false);
      }
    };
    fetchPlans();
  }, [useProp]);

  const formatPrice = (plan) => {
    if (plan.contact_sales_only) return 'Contact sales';
    const price = parseFloat(plan.price_usd);
    if (!price || price === 0) return 'Free';
    return `$${price}`;
  };

  const isPopular = (plan) => getPlanCode(plan) === 'growth';

  const handlePlanSelection = (plan) => {
    if (plan.contact_sales_only) { navigate('/contact'); return; }
    const token = Cookies.get('kotha_token');
    navigate(token ? '/choose-plan' : '/signin');
  };

  if (loading) {
    return (
      <section className="pricing py-16 sm:py-20">
        <div className="container growth-content flex flex-col items-center justify-center gap-8 overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-5xl md:text-6xl leading-[120%] text-[#0C0900] font-bold text-center">
              Simple, scalable pricing
            </h2>
            <p className="font-normal text-base leading-[140%] text-[#0C0900] text-center">
              Loading pricing plans...
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[20px] p-6 bg-gray-200 animate-pulse">
                <div className="space-y-2">
                  <div className="h-6 bg-gray-300 rounded" />
                  <div className="h-8 bg-gray-300 rounded" />
                  <div className="h-10 bg-gray-300 rounded mt-4" />
                </div>
                <div className="mt-6 space-y-2">
                  {[1, 2, 3, 4, 5].map((j) => <div key={j} className="h-4 bg-gray-300 rounded" />)}
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
      <section className="pricing py-16 sm:py-20">
        <div className="container growth-content flex flex-col items-center justify-center gap-8 overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-5xl md:text-6xl leading-[120%] text-[#0C0900] font-bold text-center">
              Simple, scalable pricing
            </h2>
            <p className="font-normal text-base leading-[140%] text-red-600 text-center">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pricing py-16 sm:py-20">
      <div className="container flex flex-col gap-10 overflow-hidden">

        <div className="flex flex-col items-center text-center gap-4">
          <div className="space-y-3 max-w-2xl mb-5 px-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl leading-[120%] text-[#0C0900] font-bold">
              Simple, scalable pricing
            </h2>
            <p className="font-normal text-base leading-[150%] text-[#0C0900]">
              No credit card required to start.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => {
            const popular = isPopular(plan);
            return (
              <div
                key={plan.id || index}
                className={`relative min-w-0 rounded-3xl border p-6 sm:p-7 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-1 ${
                  popular ? 'bg-[#000b41] border-[#000b41] text-white' : 'bg-white border-[#E5E7EB]'
                }`}
              >
                {popular && (
                  <div className="absolute -top-3 left-6 rounded-full bg-[#6200FF] px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-5">
                  <h3 className={`text-2xl font-bold mb-1 ${popular ? 'text-white' : 'text-[#0C0900]'}`}>
                    {getPlanDisplayName(plan)}
                  </h3>
                  <p className={`mb-4 text-sm leading-[150%] ${popular ? 'text-white/65' : 'text-[#0C0900]/60'}`}>
                    {getPlanDescription(plan)}
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className={`text-4xl font-bold leading-tight ${popular ? 'text-white' : 'text-[#0C0900]'}`}>
                      {formatPrice(plan)}
                    </span>
                    {!plan.contact_sales_only && parseFloat(plan.price_usd) > 0 && (
                      <span className={`text-sm pb-1 ${popular ? 'text-white/60' : 'text-gray-500'}`}>
                        /month
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <Button
                  type={popular ? 'primary' : 'default'}
                  size="large"
                  onClick={() => handlePlanSelection(plan)}
                  className={`w-full h-11 font-semibold ${
                    popular ? 'bg-[#6200FF] border-[#6200FF] hover:bg-[#5000CC]' : ''
                  }`}
                >
                  {plan.contact_sales_only ? 'Contact sales' : 'Get started'}
                </Button>

                <div className={`border-t mt-5 ${popular ? 'border-white/10' : 'border-gray-100'}`} />

                {/* Limits */}
                <SectionLabel popular={popular}>Limits</SectionLabel>
                <div className="space-y-2">
                  <FeatureRow label={`${plan.max_agents} agent${plan.max_agents > 1 ? 's' : ''}`} enabled popular={popular} />
                  <FeatureRow label={`${formatNumber(plan.max_messages_per_month)} messages / month`} enabled popular={popular} />
                  <FeatureRow label={`${plan.max_team_members} team member${plan.max_team_members > 1 ? 's' : ''}`} enabled popular={popular} />
                </div>

                {/* Channels */}
                <SectionLabel popular={popular}>Channels</SectionLabel>
                <div className="space-y-2">
                  <FeatureRow label="Website Widget" enabled={toBool(plan.website_widget)} popular={popular} />
                  <FeatureRow label="Facebook Messenger" enabled={toBool(plan.messenger)} popular={popular} />
                  <FeatureRow label="Instagram" enabled={toBool(plan.instagram)} popular={popular} />
                  <FeatureRow label="WhatsApp" enabled={toBool(plan.whatsapp)} popular={popular} />
                </div>

                {/* Workflows */}
                <SectionLabel popular={popular}>Workflows</SectionLabel>
                <div className="space-y-2">
                  <FeatureRow label="Booking System" enabled={toBool(plan.booking)} popular={popular} />
                  <FeatureRow label="Complaints Management" enabled={toBool(plan.complaints)} popular={popular} />
                </div>

                {/* Knowledge */}
                <SectionLabel popular={popular}>Knowledge</SectionLabel>
                <div className="space-y-2">
                  <FeatureRow label="Website Data" enabled={toBool(plan.website_data)} popular={popular} />
                  <FeatureRow label="WordPress Data" enabled={toBool(plan.wordpress_data)} popular={popular} />
                </div>

                {/* Commerce */}
                <SectionLabel popular={popular}>Commerce</SectionLabel>
                <div className="space-y-2">
                  <FeatureRow label="Internal Commerce" enabled={toBool(plan.internal_commerce)} popular={popular} />
                  <FeatureRow label="WooCommerce" enabled={toBool(plan.woocommerce)} popular={popular} />
                  <FeatureRow label="Shopify" enabled={toBool(plan.shopify)} popular={popular} />
                  <FeatureRow label="Product Recommendations" enabled={toBool(plan.product_recommendations)} popular={popular} />
                  <FeatureRow label="Order Processing" enabled={toBool(plan.order_processing)} popular={popular} />
                  <FeatureRow label="Order Tracking" enabled={toBool(plan.order_tracking)} popular={popular} />
                </div>

                {/* Reporting */}
                <SectionLabel popular={popular}>Reporting</SectionLabel>
                <div className="space-y-2">
                  <FeatureRow label="Analytics" enabled={toBool(plan.analytics)} popular={popular} />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500">
          Need a custom plan for your enterprise?{' '}
          <a href="/contact" className="text-[#6200FF] font-medium hover:underline">
            Contact our support team
          </a>
          .
        </p>
      </div>
    </section>
  );
};

export default Pricing;
