import { Bot, DatabaseZap, Store } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Connect your store',
      description: 'Import products and business knowledge from Shopify or WooCommerce.',
      Icon: Store,
    },
    {
      number: '02',
      title: 'Train your AI',
      description: 'Add website content, FAQs, documents, and prompts.',
      Icon: DatabaseZap,
    },
    {
      number: '03',
      title: 'Start assisting shoppers',
      description: 'Answer questions, recommend products, and support customers automatically.',
      Icon: Bot,
    },
  ];

  return (
    <section className="py-20">
      <div className="container flex flex-col gap-10">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6200ff]">How it works</p>
          <h2 className="text-4xl font-bold leading-[120%] text-[#0C0900] md:text-5xl">
            Launch your AI store assistant in minutes
          </h2>
          <p className="text-base leading-[160%] text-[#0C0900]/70">
            Connect your store knowledge, shape the assistant, and let it start helping shoppers right away.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#6200ff] text-sm font-bold text-white">
                  {step.number}
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#6200ff]/10 text-[#6200ff]">
                  <step.Icon size={18} />
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold leading-[130%] text-[#0C0900]">{step.title}</h3>
              <p className="mt-3 text-sm leading-[170%] text-[#0C0900]/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
