import { Button } from 'antd';
import { Check } from 'lucide-react';

const CustomerInteractions = ({ data }) => {
  return (
    <section className="py-20">
      {data ? (
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">Always on</p>
                <h2 className="text-4xl md:text-5xl leading-[120%] text-[#0C0900] font-bold">
                  {data.title}
                </h2>
              </div>
              <p className="font-normal text-base leading-[160%] text-[#0C0900]">
                {data.description}
              </p>
              <div className="grid gap-3">
                {data.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="mt-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#6200ff]/10 text-[#6200ff]">
                      <Check size={16} />
                    </span>
                    <span className="text-[#0C0900] mt-0.5 font-semibold text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button type="primary">Build your agent now</Button>
                <span className="text-xs text-gray-500">Launch in minutes. No code required.</span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                <div className="absolute -top-4 left-6 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6200ff] shadow">
                  24/7 coverage
                </div>
                <img src={data.image} alt="Customer Interactions" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default CustomerInteractions;
