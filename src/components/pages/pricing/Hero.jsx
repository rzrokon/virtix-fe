import { Button, Spin } from 'antd';
import { Check } from 'lucide-react';
import { useMemo } from 'react';

export default function Hero({ plans = [], loading = false }) {
  // Convert API plan → UI plan (keep your exact UI structure)
  const uiPlans = useMemo(() => {
    if (!plans?.length) return [];

    return plans.map((p) => {
      const price = parseFloat(p.price_usd);

      // ✅ Free if $0
      const priceLabel =
        p.contact_sales_only ? "Contact sales" : (price === 0 ? "Free" : `$${price} USD`);

      // ✅ Monthly only
      const periodLabel = p.contact_sales_only ? "" : "/Month";

      const features = [
        `Up to ${p.max_agents} agent${p.max_agents > 1 ? 's' : ''}`,
        `${p.max_files} files`,
        `${Number(p.max_messages_per_month || 0).toLocaleString()} messages/month`,
        `${Math.round(p.max_storage_bytes / 1e9)}GB storage`,
        `${Math.round(p.max_index_bytes / 1e6)}MB index capacity`,
        p.lead_gen ? "Lead generation" : null,
        p.booking ? "Booking system" : null,
        p.complaints ? "Complaints management" : null,
        p.products_orders ? "Products & Orders" : null,
        p.offers ? "Special offers" : null,
      ].filter(Boolean);

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        price: priceLabel,
        period: periodLabel,
        features,
        popular: p.code === "business",
        buttonText: p.contact_sales_only ? "Contact Sales" : "Get Started"
      };
    });
  }, [plans]);

  return (
    <section className="hero-section pt-40 pb-20">
      <div className="container ">
        <div className="space-y-8 text-center ">
          <div className='md:w-3xl mx-auto space-y-6'>
            <h1 className="text-6xl leading-[120%] text-[#0C0900] font-semibold">
              Simple pricing
            </h1>

            {/* ✅ Removed Yearly tab completely */}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {uiPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={` rounded-[20px] p-6 ${
                    plan.popular
                      ? 'bg-[#F4EDFF] border-2 border-[#6200FF]'
                      : 'bg-[linear-gradient(172.42deg,#FFFFFF_4.56%,#E7D7FF_50.03%,#FFFFFF_95.51%)] border border-[#ECECEC]'
                  }`}
                >
                  <div className="space-y-2">
                    <h3 className="text-xl leading-[140%] text-[#0C0900] font-semibold">{plan.name}</h3>

                    <div className="plan-price text-2xl leading-[140%] text-[#0C0900] font-semibold">
                      <span className="price">{plan.price}</span>
                    </div>

                    {plan.period ? (
                      <div className="text-[18px] leading-[160%] text-[#0C0900] font-medium">{plan.period}</div>
                    ) : null}

                    <Button type="primary" className='w-full'>
                      {plan.buttonText}
                    </Button>
                  </div>

                  <div className="plan-features mt-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex md:flex-row flex-col gap-2">
                        <Check size={16} className="check-icon" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}