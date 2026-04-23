import {
  BarChart3,
  FileText,
  Megaphone,
  MessageCircleQuestion,
  PackageCheck,
  ShoppingBag,
  UserCheck,
  UsersRound
} from 'lucide-react';

const ActionBlocks = () => {
  const actions = [
    {
      title: 'Answer product questions',
      description: 'Train on your store content and product data.',
      Icon: MessageCircleQuestion,
    },
    {
      title: 'Recommend products',
      description: 'Help shoppers choose the right item.',
      Icon: ShoppingBag,
    },
    {
      title: 'Track orders',
      description: 'Answer common post-purchase questions.',
      Icon: PackageCheck,
    },
    {
      title: 'Capture leads',
      description: 'Collect customer info from interested visitors.',
      Icon: UserCheck,
    },
    {
      title: 'Promote offers',
      description: 'Surface deals and promotions in conversation.',
      Icon: Megaphone,
    },
    {
      title: 'Reduce support load',
      description: 'Automate repetitive questions.',
      Icon: UsersRound,
    },
    {
      title: 'Learn from your store content',
      description: 'Use website pages, FAQs, and documents.',
      Icon: FileText,
    },
    {
      title: 'See conversation insights',
      description: 'Understand what shoppers ask most.',
      Icon: BarChart3,
    },
  ];

  return (
    <section className="py-20">
      <div className="container flex flex-col gap-10">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">What your AI can actually do</p>
          <h2 className="text-5xl leading-[120%] text-[#0C0900] font-bold">More than chat — built to help stores sell</h2>
          <p className="font-normal text-base leading-[160%] text-[#0C0900]">
            Turn common store conversations into faster answers, better recommendations, and fewer missed sales.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <div
              key={action.title}
              className="group rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white via-[#f7f7ff] to-[#f0f6ff] p-5 text-center shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-1 hover:border-[#6200FF]/40 hover:shadow-[0_18px_40px_rgba(98,0,255,0.12)]"
            >
              <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_10px_20px_rgba(15,23,42,0.08)] text-[#6200ff]">
                <action.Icon size={18} />
              </div>
              <p className="mt-4 text-base font-semibold text-[#0C0900] leading-[140%]">
                {action.title}
              </p>
              <p className="mt-2 text-sm font-normal leading-[160%] text-[#0C0900]/70">
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActionBlocks;
