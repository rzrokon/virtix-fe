
const ExploreAgents = () => {
  const agents = [
    {
      title: "No‑code builder",
      description: "Create agents with forms and toggles. No engineering needed.",
      icon: "/assets/images/Home/image-1.png"
    },
    {
      title: "Docs & data",
      description: "Upload PDFs, site links, product sheets. Index to keep answers on‑brand.",
      icon: "/assets/images/Home/image-2.png"
    },
    {
      title: "Embeddable widget",
      description: "Drop‑in chat for your site/app. One snippet, fully branded.",
      icon: "/assets/images/Home/image-3.png"
    },
  ];

  return (
    <section className="explore-agents py-20">
      <div className="container flex flex-col items-center justify-center gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agents.map((agent, index) => (
            <div key={index} className="bg-[#f6f6f6] border border-[#D9D9D9] rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
              <div className="agent-icon">
                <img src={agent.icon} alt={agent.title} />
              </div>
              <h3 className="text-lg leading-[140%] text-center text-[#0C0900] font-bold">{agent.title}</h3>
              <p className="agent-description font-normal text-base leading-[140%] text-center text-[#0C0900]">{agent.description}</p>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreAgents;