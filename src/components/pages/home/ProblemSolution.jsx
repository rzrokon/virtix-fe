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
                Customer questions are costing you sales
              </h2>
            </div>

            <div className="space-y-3">
              <p className="text-base leading-[150%] text-[#0C0900]">
                Every online store gets the same questions again and again:
              </p>
              <ul className="list-disc space-y-1 pl-6 text-base leading-[150%] text-[#0C0900]">
                <li>Is this available?</li>
                <li>What&apos;s the delivery time?</li>
                <li>Do you have another size or color?</li>
                <li>How can I track my order?</li>
              </ul>
              <p className="text-base leading-[150%] text-[#0C0900]">
                When customers do not get quick answers, they leave.
              </p>
              <div className="grid gap-3">
                {[
                  'Missed product questions = lost sales',
                  'Slow replies reduce conversion',
                  'Support teams repeat the same answers',
                  'Customers drop before checkout'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#6200ff]/10 text-[#6200ff]">
                      <CheckCircle2 size={16} />
                    </span>
                    <span className="text-[#0C0900] font-semibold leading-[160%]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-white via-[#f3f7ff] to-[#eef3ff] p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#6200ff]/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#00d4ff]/10 blur-2xl" />
            <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">The solution</p>
            <h3 className="mt-3 text-3xl leading-[120%] text-[#0C0900] font-bold">
              Meet your AI store assistant
            </h3>

            <p className="mt-4 text-base leading-[150%] text-[#0C0900]">
              Give shoppers instant help from product discovery to post-purchase support.
            </p>

            <div className="mt-6 space-y-3">
              {[
                'Answers instantly',
                'Recommends products',
                'Supports customers 24/7',
                'Helps recover lost sales'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#6200ff]/10 text-[#6200ff]">
                    <ArrowRight size={16} />
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
