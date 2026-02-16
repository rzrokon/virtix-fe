import { Briefcase, Building2, ShoppingCart, Stethoscope } from 'lucide-react';

const ExploreAgents = () => {
  // Repositioned as “Who it's for” to help visitors self-identify fast.
  const segments = [
    {
      title: "Online stores",
      description: "Guide shoppers, recommend products, explain pricing, and assist with orders.",
      icon: ShoppingCart
    },
    {
      title: "Clinics & consultants",
      description: "Answer FAQs, book appointments, and reduce front-desk load.",
      icon: Stethoscope
    },
    {
      title: "Agencies & services",
      description: "Capture and qualify leads automatically — even outside business hours.",
      icon: Briefcase
    },
    {
      title: "Enterprises",
      description: "Scale support with consistent answers, analytics, and stronger controls.",
      icon: Building2
    },
  ];

  return (
    <section className="explore-agents py-20">
      <div className="container flex flex-col items-center justify-center gap-10">
        <div className="max-w-3xl text-center space-y-3">
          <h2 className="text-5xl leading-[120%] text-[#0C0900] font-bold">
            Built for businesses that talk to customers every day
          </h2>
          <p className="font-normal text-base leading-[160%] text-[#0C0900]">
            Whether you sell products, services, or expertise — Virtix AI helps you handle chats, leads, bookings, and support in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
          {segments.map((seg, index) => (
            <div
              key={index}
              className="bg-[#f6f6f6] border border-[#D9D9D9] rounded-2xl p-6 flex flex-col items-center justify-center gap-4"
            >
              <div className="for-whom-icon" aria-hidden="true">
                <seg.icon size={42} strokeWidth={1.8} />
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
