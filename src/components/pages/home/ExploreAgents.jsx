import { ClipboardList, MessageCircleQuestion, PackageCheck, ShoppingBag } from 'lucide-react';

const ExploreAgents = () => {
  const useCases = [
    {
      title: 'Product questions',
      description: 'Answer availability, size, color, materials, and delivery questions.',
      icon: MessageCircleQuestion
    },
    {
      title: 'Order support',
      description: 'Help customers check shipping, delivery, and order status.',
      icon: PackageCheck
    },
    {
      title: 'Product recommendations',
      description: 'Guide shoppers to the right product.',
      icon: ShoppingBag
    },
    {
      title: 'Lead capture',
      description: 'Collect visitor details when they are not ready to buy yet.',
      icon: ClipboardList
    },
  ];

  return (
    <section className="explore-agents py-20">
      <div className="container flex flex-col items-center justify-center gap-10">
        <div className="max-w-3xl text-center space-y-3">
          <h2 className="text-5xl leading-[120%] text-[#0C0900] font-bold">
            Built for online stores
          </h2>
          <p className="font-normal text-base leading-[160%] text-[#0C0900]">
            Help shoppers find answers, choose products, and keep moving toward checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white via-[#f7f7ff] to-[#f0f6ff] p-6 flex flex-col items-center justify-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#6200FF]/40 hover:shadow-[0_18px_40px_rgba(98,0,255,0.12)]"
            >
              <div className="for-whom-icon rounded-2xl bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-transform duration-200 group-hover:scale-105" aria-hidden="true">
                <useCase.icon size={40} strokeWidth={1.8} />
              </div>
              <h3 className="text-lg leading-[140%] text-center text-[#0C0900] font-bold">{useCase.title}</h3>
              <p className="agent-description font-normal text-base leading-[160%] text-center text-[#0C0900]">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreAgents;
