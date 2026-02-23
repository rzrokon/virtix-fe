import { Button } from 'antd';
import { Check } from 'lucide-react';

const FeatureSection = ({ data, reverse = false }) => {
  if (!data) return null;
  const { title, description, image, features = [] } = data;

  return (
    <section className="py-20">
      <div className="container">
        <div className={`grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center ${reverse ? 'lg:grid-cols-[1fr_1.1fr]' : ''}`}>
          <div className={`${reverse ? 'order-1 lg:order-2' : 'order-2 lg:order-1'} space-y-6`}>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">Feature highlight</p>
              <h2 className="text-4xl md:text-5xl leading-[120%] text-[#0C0900] font-bold">
                {title}
              </h2>
            </div>
            <p className="font-normal text-base leading-[160%] text-[#0C0900]">
              {description}
            </p>
            <div className="grid gap-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#6200ff]/10 text-[#6200ff]">
                    <Check size={16} />
                  </span>
                  <span className="text-[#0C0900] font-semibold text-sm leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
            <Button type="primary">Build your agent now</Button>
          </div>

          <div className={`${reverse ? 'order-2 lg:order-1' : 'order-1 lg:order-2'}`}>
            <div className="rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
              <img src={image} alt={title || 'Feature'} className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
