const AIGrowth = () => {
  const data = [
    {
      title: "Product Guidance",
      description: "Ask needs, compare options, recommend products, and assist with purchase intent.",
      image: "/assets/images/Home/image-50.png"
    },
    {
      title: "Pricing Help",
      description: "Explain tiers, bundles, promotions, and pricing clearly and consistently.",
      image: "/assets/images/Home/image-51.png"
    },
    {
      title: "Offer Promotion",
      description: "Announce campaigns and guide customers to the right offer based on eligibility.",
      image: "/assets/images/Home/image-52.png"
    },
    {
      title: "Appointments",
      description: "Availability checks, booking, reminders, and rescheduling — all in chat.",
      image: "/assets/images/Home/image-53.png"
    },
    {
      title: "Complaints",
      description: "Collect details, attach files, and log complaints with full context.",
      image: "/assets/images/Home/image-54.png"
    },
    {
      title: "Knowledge Answers",
      description: "Reliable replies grounded in your indexed docs and website content.",
      image: "/assets/images/Home/image-55.png"
    },
    {
      title: "Analytics",
      description: "Track topics, drop-offs, conversion points, and operational impact.",
      image: "/assets/images/Home/image-56.png"
    },
    {
      title: "Security",
      description: "RBAC, audit logs, and enterprise-ready controls.",
      image: "/assets/images/Home/image-57.png"
    },
  ];

  return (
    <section className="ai-growth py-20 bg-[#000B41]">
      <div className="container">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 text-white">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60 font-semibold">Capabilities</p>
              <h2 className="text-4xl md:text-5xl leading-[120%] font-bold">
                Functional agent benefits
              </h2>
              <p className="font-normal text-base leading-[160%] text-white/80">
                Go beyond small talk — build agents that take real action. Turn conversations into outcomes that drive your business forward.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span className="h-2 w-2 rounded-full bg-white/40" />
              <span>Action-ready outcomes</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.map((item) => (
              <div
                key={item.title}
                className="group rounded-3xl border border-white/10 bg-white/5 p-5 transition-transform duration-200 hover:-translate-y-1 hover:border-white/30"
              >
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <img src={item.image} alt={item.title} height={24} width={24} />
                  </div>
                  <span className="text-xs text-white/50">Benefit</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/75">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIGrowth;
