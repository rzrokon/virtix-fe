import { Bot, Database, Rocket } from 'lucide-react';

const steps = [
  {
    title: 'Create agent',
    icon: Bot,
    description:
      'Set your agent’s name, tone, and purpose. Define how it represents your brand and interacts with users.',
  },
  {
    title: 'Connect your data',
    icon: Database,
    description:
      'Upload docs, add site links, and connect product/service info so answers stay accurate, consistent, and on-brand.',
  },
  {
    title: 'Embed & launch',
    icon: Rocket,
    description:
      'Copy the widget code and add it to your site. Go live and let your agent start engaging users instantly.',
  },
];

export default function BuildAgent() {
  return (
    <section className="py-20 bg-[#000B41]">
      <div className="container flex flex-col gap-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 font-semibold">Fast track</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Build an AI agent in 3 steps</h2>
          </div>
          <p className="text-white/80 max-w-xl">
            No code required — connect, customize, and go live. Each step is designed to get you from idea to launch in minutes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                    <Icon size={26} strokeWidth={1.6} />
                  </div>
                  <span className="text-sm tracking-[0.3em] text-white/60 font-semibold">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{step.description}</p>
                <div className="mt-6 h-[2px] w-12 rounded-full bg-gradient-to-r from-white/70 to-white/10" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
