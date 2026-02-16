import { ArrowRight } from 'lucide-react';

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

          <div className="bg-[#F6F6F6] border border-[#D9D9D9] rounded-2xl p-8">
            <h3 className="text-3xl leading-[120%] text-[#0C0900] font-bold">Meet Virtix AI</h3>

            <p className="mt-3 text-base leading-[160%] text-[#0C0900]">
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
                  <ArrowRight size={18} className="mt-1.25 text-[#6200FF]" />
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