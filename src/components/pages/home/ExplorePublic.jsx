import { Button } from 'antd';
import { ArrowRight } from 'lucide-react';

export default function ExplorePublic() {
  const agents = [
    {
      title: "Product Advisor",
      description: "Guides shoppers, compares features, applies promos.",
      icon: "/assets/images/Home/user-1.png",
      backgroundColor: "#E7D7FF"
    },
    {
      title: "Docs & data",
      description: "Upload PDFs, site links, product sheets. Index to keep answers on‑brand.",
      icon: "/assets/images/Home/user-2.png",
      backgroundColor: "#CBEED8"
    },
    {
      title: "Embeddable widget",
      description: "Drop‑in chat for your site/app. One snippet, fully branded.",
      icon: "/assets/images/Home/user-3.png",
      backgroundColor: "#F7EBD6"
    },
  ];

  return (
    <section className="explore-agents py-20">
      <div className="container flex flex-col items-center justify-center gap-8">
        <h2 className="text-6xl leading-[120%] text-[#0C0900] font-bold">Explore Public AI Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agents.map((agent, index) => (
            <div key={index} style={{ backgroundColor: agent.backgroundColor }} className={`border border-[#D9D9D9] rounded-2xl flex flex-col items-center justify-center gap-4 relative `}>
              <div className="agent-icon">
                <img src={agent.icon} alt={agent.title} />
              </div>
              <div className='bg-gray-500/50 absolute bottom-0 text-white flex flex-col items-center justify-center gap-4 p-6 '>
                <h3 className="text-lg leading-[140%] text-center  font-bold">{agent.title}</h3>
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
