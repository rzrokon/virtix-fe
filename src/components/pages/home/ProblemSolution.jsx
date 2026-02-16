import { CheckCircle2 } from 'lucide-react';

export default function ProblemSolution() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-5xl leading-[120%] text-[#0C0900] font-bold">
              Customer conversations don’t scale — teams do
            </h2>

            <p className="font-normal text-base leading-[160%] text-[#0C0900]">
              As you grow, messages come from everywhere. Questions repeat. Leads get missed. Support costs rise — and
              customer experience drops.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {[
                'Missed leads and slow responses',
                'Repetitive questions that burn team time',
                'Orders, bookings, and complaints lost in chat threads',
                'No visibility into what customers really ask'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-2.5 h-2 w-2 rounded-full bg-[#6200FF]" />
                  <span className="text-[#0C0900] font-semibold leading-[160%]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-white via-[#f3f7ff] to-[#eef3ff] p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#6200ff]/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#00d4ff]/10 blur-2xl" />
            <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">Solution</p>
            <h3 className="mt-3 text-3xl leading-[120%] text-[#0C0900] font-bold">Meet Virtix AI</h3>

            <p className="mt-4 text-base leading-[160%] text-[#0C0900]">
              One AI agent to answer questions, capture leads, take orders, book appointments, and log complaints — 24/7.
            </p>

            <div className="mt-6 space-y-3">
              {[
                'Instant, on-brand answers from your data',
                'Conversation-based operations (leads, orders, bookings)',
                'Human escalation with full context',
                'Analytics to track outcomes'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#6200ff]/10 text-[#6200ff]">
                    <CheckCircle2 size={16} />
                  </span>
                  <span className="text-[#0C0900] font-semibold leading-[160%]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
