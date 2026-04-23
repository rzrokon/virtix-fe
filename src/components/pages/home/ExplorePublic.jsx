import { Button } from 'antd';
import { ArrowRight, BriefcaseBusiness, HeartPulse, PackageCheck, ShoppingBag, ShoppingCart } from 'lucide-react';

export default function ExplorePublic() {
  const agents = [
    {
      title: 'WooCommerce Store Agent',
      description: 'Answer product questions, recommend items, and support WooCommerce shoppers from discovery to order updates.',
      Icon: ShoppingCart,
      accentIcon: PackageCheck,
      backgroundColor: '#F1E7FF',
      iconColor: '#7F54B3',
      link: 'https://virtixai.xyz/ecommerce/index.html'
    },
    {
      title: 'Shopify Store Agent',
      description: 'Guide Shopify customers with instant answers about availability, variants, delivery, and product fit.',
      Icon: ShoppingBag,
      accentIcon: ArrowRight,
      backgroundColor: '#ECF7DA',
      iconColor: '#95BF47',
      link: 'https://virtixai.xyz/ecommerce/index.html'
    },
    {
      title: 'Clinics or Agency Support Agent',
      description: 'Handle service questions, collect lead details, and help visitors book the next step automatically.',
      Icon: HeartPulse,
      accentIcon: BriefcaseBusiness,
      backgroundColor: '#FFF1D8',
      iconColor: '#D97706',
      link: 'https://virtixai.xyz/agency/index.html'
    },
  ];

  return (
    <section className="explore-agents py-20">
      <div className="container flex flex-col items-center gap-10">
        <div className="text-center space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">Live demos</p>
          <h2 className="text-4xl md:text-5xl leading-[120%] text-[#0C0900] font-bold">
            See Virtix AI in action
          </h2>
          <p className="font-normal text-base leading-[160%] text-[#0C0900]">
            Try store-focused demo agents and see how Virtix AI answers questions, recommends products, and supports customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl mx-auto">
          {agents.map((agent, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-[#E5E7EB] bg-[#f9fafb] p-5 transition-transform duration-200 hover:-translate-y-1 hover:border-[#6200FF]/30 hover:shadow-[0_16px_32px_rgba(98,0,255,0.12)]"
            >
              <div className="flex items-center gap-4">
                <div
                  className="relative h-14 w-14 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: agent.backgroundColor }}
                >
                  <agent.Icon size={26} color={agent.iconColor} strokeWidth={1.9} />
                  <span className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-[0_6px_14px_rgba(15,23,42,0.14)]">
                    <agent.accentIcon size={13} color={agent.iconColor} strokeWidth={2.2} />
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0C0900]">{agent.title}</h3>
                  <p className="text-xs text-gray-500">Demo AI agent</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-[#0C0900]/80">{agent.description}</p>

              <Button
                type="primary"
                href={agent.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 w-full flex items-center justify-center gap-2"
              >
                Try Agent <ArrowRight size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
