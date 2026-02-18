import {
  BarChart3,
  Calendar,
  FileText,
  Megaphone,
  MessageSquareWarning,
  ShoppingBag,
  Tag,
  UserCheck
} from 'lucide-react';

const ActionBlocks = () => {
  const actions = [
    {
      label: 'Product guidance & recommendations',
      Icon: ShoppingBag,
    },
    {
      label: 'Pricing explanations & plan comparisons',
      Icon: Tag,
    },
    {
      label: 'Lead capture & qualification',
      Icon: UserCheck,
    },
    {
      label: 'Appointment scheduling',
      Icon: Calendar,
    },
    {
      label: 'Complaint intake with full context',
      Icon: MessageSquareWarning,
    },
    {
      label: 'Offer promotion & upselling',
      Icon: Megaphone,
    },
    {
      label: 'Answers from your documents',
      Icon: FileText,
    },
    {
      label: 'Conversation analytics & insights',
      Icon: BarChart3,
    },
  ];

  return (
    <section className="py-20">
      <div className="container flex flex-col gap-10">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">What your AI can actually do</p>
          <h2 className="text-5xl leading-[120%] text-[#0C0900] font-bold">More than chat — real business actions</h2>
          <p className="font-normal text-base leading-[160%] text-[#0C0900]">
            Real-world actions that move the business forward
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <div
              key={action.label}
              className="group rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white via-[#f7f7ff] to-[#f0f6ff] p-5 text-center shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-1 hover:border-[#6200FF]/40 hover:shadow-[0_18px_40px_rgba(98,0,255,0.12)]"
            >
              <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_10px_20px_rgba(15,23,42,0.08)] text-[#6200ff]">
                <action.Icon size={18} />
              </div>
              <p className="mt-4 text-base font-semibold text-[#0C0900] leading-[140%]">
                {action.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActionBlocks;
