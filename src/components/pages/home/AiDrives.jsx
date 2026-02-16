import { Button } from 'antd';

export default function AiDrives() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] items-center">
          <div className="order-2 lg:order-2 space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">Growth engine</p>
              <h2 className="text-4xl md:text-5xl leading-[120%] text-[#0C0900] font-bold">
                AI that drives growth — without extra headcount
              </h2>
            </div>

            <p className="font-normal text-base leading-[160%] text-[#0C0900]">
              Turn every chat into an opportunity. Capture leads, guide purchases, and reduce repetitive support work —
              while keeping full visibility into performance.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <div className="text-3xl font-semibold text-[#0C0900]">35%</div>
                <p className="mt-2 text-sm text-[#0C0900]/70">Up to more leads</p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <div className="text-3xl font-semibold text-[#0C0900]">45%</div>
                <p className="mt-2 text-sm text-[#0C0900]/70">Up to less support load</p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <div className="text-3xl font-semibold text-[#0C0900]">2×</div>
                <p className="mt-2 text-sm text-[#0C0900]/70">More guided conversations</p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <div className="text-3xl font-semibold text-[#0C0900]">100%</div>
                <p className="mt-2 text-sm text-[#0C0900]/70">Conversation visibility</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button type="primary">Build your agent now</Button>
              <p className="text-xs text-gray-500">Metrics are indicative and may vary by business, traffic, and setup.</p>
            </div>
          </div>

          <div className="order-1 lg:order-1">
            <div className="relative rounded-[32px] border border-black/10 bg-gradient-to-br from-[#f6f0ff] via-white to-[#e9f5ff] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
              <div className="absolute -top-4 right-6 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6200ff] shadow">
                Live metrics
              </div>
              <img src="/assets/images/Home/AI-Drives.png" alt="Customer Interactions" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
