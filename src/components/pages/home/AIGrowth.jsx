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
        <div className="growth-content flex flex-col items-center justify-center gap-8">
          <div className="md:w-3xl space-y-4">
            <h2 className="text-5xl leading-[120%] text-white font-bold text-center">
              Functional agent benefits
            </h2>
            <p className="font-normal text-base leading-[140%] text-white text-center">
              Go beyond small talk — build agents that take real action. Turn conversations into outcomes that drive your business forward.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.map((item) => (
              <div
                key={item.title}
                className="bg-[#1d254b] text-white p-4 rounded-[16px] text-center space-y-2"
              >
                <img src={item.image} alt={item.title} height={30} width={30} className="mx-auto" />
                <h3 className="text-2xl leading-[120%] font-semibold mt-4">{item.title}</h3>
                <p className="text-base">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIGrowth;