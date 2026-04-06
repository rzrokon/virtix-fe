import CTA from '../../components/pages/home/CTA';

const pillars = [
  {
    title: 'Conversation-first design',
    description:
      'We build around the real flow of customer conversations, so businesses can answer faster, route smarter, and act without switching between disconnected tools.',
  },
  {
    title: 'Practical AI for operations',
    description:
      'Virtix AI is designed to do useful work: capture leads, manage bookings, handle complaints, support sales, and keep teams aligned with clear visibility.',
  },
  {
    title: 'Control with clarity',
    description:
      'Teams need more than automation. They need knowledge controls, human handover, reporting, integrations, and settings that make AI reliable in production.',
  },
];

const values = [
  'Fast setup without heavy implementation work',
  'Answers grounded in your own business content',
  'Operational workflows built into the same workspace',
  'Flexible integrations across website, social, and commerce',
];

export default function About() {
  return (
    <>
      <section className="py-20 bg-[#f8fafc]">
        <div className="container max-w-6xl space-y-10 text-[#0C0900]">
          <div className="mt-15 rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">About us</p>
                <h1 className="text-4xl md:text-5xl leading-[115%] font-bold">
                  Building AI agents that help businesses run customer operations better
                </h1>
                <p className="max-w-3xl text-base leading-8 text-[#0C0900]/72">
                  Virtix AI helps teams manage customer conversations across support, sales, bookings, complaints,
                  products, and orders from one workspace. Our goal is simple: give businesses an AI agent that is
                  useful in day-to-day operations, not just impressive in demos.
                </p>
              </div>

              <div className="rounded-[28px] border border-[#E5E7EB] bg-[linear-gradient(135deg,#faf7ff_0%,#f7fbff_100%)] p-6">
                <p className="text-sm font-semibold text-[#6200ff]">What Virtix AI is built for</p>
                <div className="mt-4 grid gap-3">
                  {values.map((value) => (
                    <div
                      key={value}
                      className="rounded-2xl border border-white bg-white px-4 py-3 text-sm leading-6 text-[#0C0900]/76 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
              >
                <h2 className="text-2xl font-bold">{pillar.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[#0C0900]/72">{pillar.description}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-[#6200ff] font-semibold">Our approach</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight">AI should improve customer work, not complicate it</h2>
              <p className="mt-4 text-base leading-8 text-[#0C0900]/72">
                Many teams already have channels, products, customer questions, and support processes in motion.
                Virtix AI is meant to fit into that reality. We focus on clear configuration, grounded knowledge,
                practical actions, and visibility so teams can trust what the agent is doing.
              </p>
              <p className="mt-4 text-base leading-8 text-[#0C0900]/72">
                That means better answers, faster follow-up, cleaner handovers to humans, and less repetitive work for
                teams handling growing customer demand.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-[#6200ff] font-semibold">Who we serve</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight">Made for growing teams that need speed and control</h2>
              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#fafbff] px-4 py-4">
                  <p className="text-lg font-semibold">Support teams</p>
                  <p className="mt-2 text-sm leading-7 text-[#0C0900]/72">
                    Reduce repetitive replies, maintain context, and escalate sensitive cases with complete conversation history.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#fafbff] px-4 py-4">
                  <p className="text-lg font-semibold">Sales and growth teams</p>
                  <p className="mt-2 text-sm leading-7 text-[#0C0900]/72">
                    Capture leads, guide product discovery, run offers, and shorten response time during campaigns and launches.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#fafbff] px-4 py-4">
                  <p className="text-lg font-semibold">Service businesses and commerce teams</p>
                  <p className="mt-2 text-sm leading-7 text-[#0C0900]/72">
                    Coordinate bookings, complaints, products, orders, and reporting from one agent workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
