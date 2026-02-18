import { Button } from 'antd';

const CTA = () => {
  return (
    <section className="cta py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-[32px] bg-[#000b41] px-6 py-12 md:px-12 md:py-14 text-white">
          <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-[#6200FF]/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-[#00d4ff]/30 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60 font-semibold">Get started</p>
              <h2 className="text-3xl md:text-5xl leading-[120%] font-extrabold">
                Make customer experience your competitive edge
              </h2>
              <p className="text-base md:text-lg leading-[160%] text-white/80 font-semibold">
                Use Virtix AI to deliver faster, smarter, and more consistent customer interactions — without increasing headcount.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button type="primary" size="large" className="w-full md:w-[260px] bg-white text-[#0C0900] border-white hover:bg-white/90">
                Start free — no credit card
              </Button>
              <div className="text-xs text-white/60 text-center md:text-center">
                Launch in minutes. Cancel anytime.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
