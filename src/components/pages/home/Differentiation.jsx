import { CheckCircle2 } from 'lucide-react';

const Differentiation = () => {
  const points = [
    'Conversation-first operations (not just chat)',
    'Orders, bookings & complaints built-in',
    'Business-aware AI agents',
    'Structured data from every conversation',
    'Built for SMEs scaling fast',
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-start">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl leading-[120%] text-[#0C0900] font-bold">
              Why Virtix AI is different
            </h2>
            <p className="text-base leading-[160%] text-[#0C0900]/70">
              Position your agent as an operational teammate, not a chat widget.
            </p>
          </div>

          <div className="grid gap-3">
            {points.map((point) => (
              <div
                key={point}
                className="group flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#D8CCFF] hover:shadow-[0_16px_32px_rgba(98,0,255,0.18)]"
              >
                <span className="mt-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#6200ff]/10 text-[#6200ff] transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-[#6200ff]/15">
                  <CheckCircle2 size={16} />
                </span>
                <p className="font-semibold leading-[150%] text-[#0C0900]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Differentiation;
