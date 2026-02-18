import { Button } from 'antd';
import { ArrowRight } from 'lucide-react';

export default function ExplorePublic() {
  const agents = [
    {
      title: "eCommerce Sales Assistant",
      description: "Recommends products, answers pricing questions and take orders.",
      icon: "/assets/images/Home/user-1.png",
      backgroundColor: "#E7D7FF"
    },
    {
      title: "Support Knowledge Agent",
      description: "Answers FAQs from docs and policies with consistent, on-brand responses.",
      icon: "/assets/images/Home/user-2.png",
      backgroundColor: "#CBEED8"
    },
    {
      title: "Bookings & Leads Agent",
      description: "Captures lead details and books appointments automatically — 24/7.",
      icon: "/assets/images/Home/user-3.png",
      backgroundColor: "#F7EBD6"
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
            Try live demo agents to experience how Virtix AI talks, understands your customers, and drives outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {agents.map((agent, index) => (
            <div
              key={index}
              className="group rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-1 hover:border-[#6200FF]/40 hover:shadow-[0_18px_40px_rgba(98,0,255,0.12)]"
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: agent.backgroundColor }}
                >
                  <img src={agent.icon} alt={agent.title} className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#0C0900]">{agent.title}</h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Demo agent</p>
                </div>
                <span className="text-[11px] font-semibold text-[#6200ff] bg-[#6200ff]/10 px-2.5 py-1 rounded-full">
                  Live
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#0C0900]/80">{agent.description}</p>

              <Button type="primary" className="mt-6 w-full flex items-center justify-center gap-2">
                Try Agent <ArrowRight size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
