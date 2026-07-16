import { Button, message as antMessage } from 'antd';
import Cookies from 'js-cookie';
import { Check, Copy, X } from 'lucide-react';
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
  const names = { starter: 'Starter', growth: 'Growth', business: 'Business' };
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
const Pricing = ({ plans: plansProp, loading: loadingProp, showValueSection = true } = {}) => {
  const [internalPlans, setInternalPlans] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billing, setBilling] = useState('monthly');
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
    const annualMonthly = monthly * 12;
    const saved = Math.round(((annualMonthly - yearly) / annualMonthly) * 100);
    if (saved <= 0) return null;
    return `Save ${saved}%`;
  };

  const isPopular = (plan) => getPlanCode(plan) === 'growth';

  const handlePlanSelection = (plan) => {
    if (plan.contact_sales_only) { navigate('/contact'); return; }
    const token = Cookies.get('kotha_token');
    navigate(token ? `/choose-plan?cycle=${billing}` : `/signin?next=/choose-plan?cycle=${billing}`);
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
    <>
    {/* Why Virtix + Trust — home page only */}
    {showValueSection && <section className="py-16 sm:py-20">
      <div className="container max-w-5xl">
        <div className="rounded-[32px] border border-[#E5E7EB] bg-[linear-gradient(160deg,#ffffff_0%,#f6f2ff_50%,#f0f9ff_100%)] p-8 md:p-12 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

            {/* Left — value props */}
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6200FF]">Why Virtix AI</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0C0900] leading-[120%]">
                Recover More Sales Automatically
              </h2>
              <div className="space-y-3">
                {[
                  'Answer product questions instantly',
                  'Recommend relevant products',
                  'Capture customer leads',
                  'Reduce abandoned conversations',
                  'Support customers 24/7',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-green-600" />
                    </div>
                    <span className="text-sm text-[#0C0900]/80">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-[#0C0900]/50 italic border-l-2 border-[#6200FF]/30 pl-3">
                Every unanswered customer question is a potential lost sale.
              </p>
            </div>

            {/* Right — trust signals */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#0C0900]/40">Works with</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Shopify', soon: true },
                    { label: 'WooCommerce' },
                    { label: 'Custom eCommerce' },
                    { label: 'Messenger' },
                    { label: 'Instagram' },
                    { label: 'Website Widget' },
                  ].map(({ label, soon }) => (
                    <div key={label} className="flex items-center gap-2 rounded-xl bg-[#f8f6ff] px-3 py-2">
                      <Check size={13} className="text-[#6200FF] shrink-0" />
                      <span className="text-sm font-medium text-[#0C0900]">{label}</span>
                      {soon && <span className="ml-auto inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 leading-none">Soon</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-[#0C0900]/35 uppercase tracking-[0.2em]">Trusted by growing ecommerce brands</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>}

    {/* Pricing */}
    <section className="pricing py-16 sm:py-20">
      <div className="container flex flex-col gap-10 overflow-hidden">

        <div className="flex flex-col items-center text-center gap-4">
          <div className="space-y-3 max-w-2xl mb-2 px-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl leading-[120%] text-[#0C0900] font-bold">
              Simple, scalable pricing
            </h2>
            <p className="font-normal text-base leading-[150%] text-[#0C0900]">
              No credit card required to start.
            </p>
          </div>

          {/* Founder offer banner */}
          <div className="w-full max-w-3xl rounded-2xl border border-[#6200FF]/20 bg-[linear-gradient(135deg,#faf5ff_0%,#ede5ff_100%)] px-6 py-5">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1 space-y-2">
                <p className="text-lg font-bold text-[#0C0900]">🚀 Founding Customer Program</p>
                <p className="text-sm text-[#0C0900]/70">Join the first 100 stores and get 50% off for your first 12 months.</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                  {['Priority support', 'Roadmap influence', 'Early access to features'].map((item) => (
                    <div key={item} className="flex items-center gap-1.3 text-sm text-[#0C0900]/70">
                      <Check size={14} className="text-green-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0 sm:pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('FOUNDER50');
                    antMessage.success('Coupon code copied!');
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

          {/* Monthly / Yearly toggle */}
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => {
            const popular = isPopular(plan);
            const badge = savingsBadge(plan);
            const note = yearlyNote(plan);

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
                          <span className={`text-4xl font-bold leading-tight ${popular ? 'text-white' : 'text-[#0C0900]'}`}>
                            {formatPrice(plan)}
                          </span>
                          {badge && (
                            <span className="mb-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                              {badge}
                            </span>
                          )}
                        </div>
                        {isPaid && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xl font-bold leading-tight ${popular ? 'text-[#62F5A8]' : 'text-[#6200FF]'}`}>
                              {founderLabel}/mo
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              popular ? 'bg-[#62F5A8]/15 text-[#62F5A8]' : 'bg-[#6200FF]/10 text-[#6200FF]'
                            }`}>
                              Founder Price
                            </span>
                          </div>
                        )}
                        {billing === 'yearly' && yearly > 0 && isPaid ? (
                          <p className={`mt-1 text-xs ${popular ? 'text-white/50' : 'text-gray-400'}`}>
                            <span className="line-through">${yearly}/yr</span>
                            {' '}
                            <span className={popular ? 'text-[#62F5A8]/70' : 'text-[#6200FF]/70'}>
                              ${(yearly / 2) % 1 === 0 ? yearly / 2 : (yearly / 2).toFixed(2)}/yr with FOUNDER50
                            </span>
                          </p>
                        ) : note ? (
                          <p className={`mt-1 text-xs ${popular ? 'text-white/50' : 'text-gray-400'}`}>
                            {note}
                          </p>
                        ) : null}
                      </>
                    );
                  })()}
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
                  <FeatureRow label={`Ideal for stores handling up to ${formatNumber(Math.floor((plan.max_messages_per_month || 0) / 4))} customer inquiries/month`} enabled popular={popular} />
                </div>

                {/* Channels */}
                <SectionLabel popular={popular}>Channels</SectionLabel>
                <div className="space-y-2">
                  <FeatureRow label="Website Widget" enabled={toBool(plan.website_widget)} popular={popular} />
                  <FeatureRow label="Facebook Messenger" enabled={toBool(plan.messenger)} popular={popular} />
                  <FeatureRow label="Instagram" enabled={toBool(plan.instagram)} popular={popular} />
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
                  <FeatureRow label="Custom eCommerce" enabled={toBool(plan.internal_commerce)} popular={popular} />
                  <FeatureRow label="WooCommerce" enabled={toBool(plan.woocommerce)} popular={popular} />
                  <FeatureRow label={<span className="flex items-center gap-1.5">Shopify <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 leading-none">Soon</span></span>} enabled={false} popular={popular} />
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
    </>
  );
};

export default Pricing;
