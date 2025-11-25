
const AIGrowth = () => {
  const data = [
    {
      title: "Product Guidance",
      discription: "Ask needs, compare options, recommend SKUs, add to cart.",
      image: "/assets/images/Home/image-50.png"
    },
    {
      title: "Pricing Help",
      discription: "Explain tiers, compute bundles, apply coupons, upsell ethically.",
      image: "/assets/images/Home/image-51.png"
    },
    {
      title: "Offer Promotion",
      discription: "Announce campaigns and drive urgency with eligibility checks.",
      image: "/assets/images/Home/image-52.png"
    },
    {
      title: "Appointments",
      discription: "Availability checks, booking, reminders, and rescheduling.",
      image: "/assets/images/Home/image-53.png"
    },
    {
      title: "Complaints",
      discription: "Collect details, attach files, issue tickets with SLAs.",
      image: "/assets/images/Home/image-54.png"
    },
    {
      title: "Knowledge Answers",
      discription: "Reliable replies grounded in your indexed docs.",
      image: "/assets/images/Home/image-55.png"
    },
    {
      title: "Analytics",
      discription: "See solved topics, CSAT, drop‑offs, and revenue impact.",
      image: "/assets/images/Home/image-56.png"
    },
    {
      title: "Security",
      discription: "RBAC, audit logs, and data residency choices.",
      image: "/assets/images/Home/image-57.png"
    },
  ]
  return (
    <section className="ai-growth py-20 bg-[#000B41]">
      <div className="container">
        <div className="growth-content flex flex-col items-center justify-center gap-8">
          <div className='md:w-3xl space-y-4'>
            <h2 className="text-5xl leading-[120%] text-white font-bold text-center">
              Functional agent benefits
            </h2>
            <p className="font-normal text-base leading-[140%] text-white text-center">
              Go beyond small talk — build agents that take real action. Turn conversations into outcomes that drive your business forward.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {
              data.map(item => (
                <div key={item.title} className="bg-[#1d254b] text-white p-4 rounded-[16px] text-center space-y-2">
                  <img src={item.image} alt={item.title} height={30} width={30} className="mx-auto" />
                  <h3 className="text-2xl leading-[120%] font-semibold mt-4">{item.title}</h3>
                  <p className="text-base">
                    {item.discription}
                  </p>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </section >
  );
};

export default AIGrowth;