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
      <div className="container flex flex-col items-center justify-center gap-8">
        <div className="max-w-3xl text-center space-y-3">
          <h2 className="text-5xl leading-[120%] text-[#0C0900] font-bold">See Virtix AI in action</h2>
          <p className="font-normal text-base leading-[160%] text-[#0C0900]">
            Try live demo agents to experience how Virtix AI talks, understands your customers, and drives outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agents.map((agent, index) => (
            <div
              key={index}
              style={{ backgroundColor: agent.backgroundColor }}
              className="border border-[#D9D9D9] rounded-2xl flex flex-col items-center justify-center gap-4 relative"
            >
              <div className="agent-icon">
                <img src={agent.icon} alt={agent.title} />
              </div>

              <div className="bg-gray-500/50 absolute bottom-0 text-white flex flex-col items-center justify-center gap-4 p-6 w-full rounded-b-2xl">
                <h3 className="text-lg leading-[140%] text-center font-bold">{agent.title}</h3>
                <p className="agent-description font-normal text-base leading-[140%] text-center">{agent.description}</p>

                <Button type="primary" className="w-full">
                  Try Agent <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}