import { Button } from 'antd';
import { Check } from 'lucide-react';

const CustomerInteractions = ({ data }) => {


  return (
    <section className="customer-interactions py-20">
      {
        data ? <div className="container">
          <div className="flex md:flex-row flex-col items-center justify-center gap-8">
            <div className="flex-2 space-y-4">
              <h2 className="text-6xl leading-[120%] text-[#0C0900] font-bold">
                {data.title}
              </h2>
              <p className="font-normal text-base leading-[140%] text-[#0C0900]">
                {data.description}
              </p>
              <div className="features-list">
                {data.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check size={20} className="check-icon" />
                    <span className='text-[#0C0900] font-semibold'>{feature}</span>
                  </div>
                ))}
              </div>
              <Button type="primary">Build your agent now</Button>
            </div>
            <div className="flex-1">
              <img src={data.image} alt="Customer Interactions" className="w-full h-auto" />
            </div>
          </div>
        </div> : null
      }
    </section>
  );
};

export default CustomerInteractions;