import { Briefcase, Building2, ShoppingCart, Stethoscope } from 'lucide-react';

const ExploreAgents = () => {
  // Repositioned as “Who it's for” to help visitors self-identify fast.
  const segments = [
    {
      title: "eCommerce",
      description: "Convert shoppers and guide purchases automatically.",
      icon: ShoppingCart
    },
    {
      title: "Clinics & Consultants",
      description: "Automate bookings and answer common questions.",
      icon: Stethoscope
    },
    {
      title: "Agencies & Services",
      description: "Capture and qualify leads 24/7.",
      icon: Briefcase
    },
    {
      title: "Enterprise Teams",
      description: "Scale support with control and visibility.",
      icon: Building2
    },
  ];

  return (
    <section className="explore-agents py-20">
      <div className="container flex flex-col items-center justify-center gap-10">
        <div className="max-w-3xl text-center space-y-3">
          <h2 className="text-5xl leading-[120%] text-[#0C0900] font-bold">
            Built for teams that rely on conversations
          </h2>
          <p className="font-normal text-base leading-[160%] text-[#0C0900]">
            If your business depends on customer conversations, Virtix AI helps you scale them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
          {segments.map((seg, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white via-[#f7f7ff] to-[#f0f6ff] p-6 flex flex-col items-center justify-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#6200FF]/40 hover:shadow-[0_18px_40px_rgba(98,0,255,0.12)]"
            >
              <div className="for-whom-icon rounded-2xl bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-transform duration-200 group-hover:scale-105" aria-hidden="true">
                <seg.icon size={40} strokeWidth={1.8} />
              </div>
              <h3 className="text-lg leading-[140%] text-center text-[#0C0900] font-bold">{seg.title}</h3>
              <p className="agent-description font-normal text-base leading-[160%] text-center text-[#0C0900]">
                {seg.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreAgents;
