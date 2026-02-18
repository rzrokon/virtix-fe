import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ProblemSolution() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">The problem</p>
              <h2 className="text-4xl md:text-5xl leading-[120%] text-[#0C0900] font-bold">
                Customer conversations don’t scale — teams do.
              </h2>
            </div>

            <div className="space-y-3">
              <p className="text-base leading-[150%] text-[#0C0900]">
                As you grow, messages multiply. Questions repeat. Leads slip. Costs rise.
              </p>
              <div className="grid gap-3">
                {[
                  'Missed leads and slow responses',
                  'Repetitive questions that drain team time',
                  'Orders and bookings buried in chat threads',
                  'No visibility into what customers actually want'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#6200ff]/10 text-[#6200ff]">
                      <CheckCircle2 size={16} />
                    </span>
                    <span className="text-[#0C0900] font-semibold leading-[160%]">{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm text-[#0C0900]/70 font-semibold">
                <p>Hiring more people isn’t scalable.</p>
                <p>Something smarter is needed.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-white via-[#f3f7ff] to-[#eef3ff] p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#6200ff]/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#00d4ff]/10 blur-2xl" />
            <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">The solution</p>
            <h3 className="mt-3 text-3xl leading-[120%] text-[#0C0900] font-bold">
              Meet Virtix AI
            </h3>

            <p className="mt-4 text-base leading-[150%] text-[#0C0900]">
              One AI agent that handles conversations like a trained team member — <span className="font-bold">24/7</span>.
            </p>

            <div className="mt-6 space-y-3">
              {[
                'Instant, on-brand answers from your data',
                'Built-in lead capture, orders, and bookings',
                'Human handover with full context',
                'Clear analytics to track outcomes'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#6200ff]/10 text-[#6200ff]">
                    <ArrowRight size={16} />
                  </span>
                  <span className="text-[#0C0900] font-semibold leading-[160%]">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-1 text-sm text-[#0C0900]/70 font-semibold">
              <p>Not just chat.</p>
              <p>Operational automation through conversation.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
