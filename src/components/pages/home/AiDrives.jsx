import { Button } from 'antd';

export default function AiDrives() {
  const features = [
    "24/7 Instant replies and actions with zero wait.",
    "Accurate answers powered by your indexed data.",
    "Seamless escalation with full chat transcripts.",
    "Scales instantly to handle traffic spikes and launches."
  ];

  return (
    <section className="customer-interactions py-20">
      <div className="container">
        <div className="flex md:flex-row flex-col items-center justify-center gap-8">
          <div className="flex-1">
            <img src="/assets/images/Home/image-5.png" alt="Customer Interactions" className="w-full h-auto" />
          </div>
          <div className="flex-1 space-y-4">
            <h2 className="text-6xl leading-[120%] text-[#0C0900] font-bold">
              AI that drives growth — effortlessly
            </h2>
            <p className="font-normal text-base leading-[140%] text-[#0C0900]">
              Turn every chat into a conversion opportunity. Track performance, capture leads, and scale support without extra effort.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 bg-[#F6F6F6] p-4 rounded-lg text-center ">
                <h4 className='text-[32px] leading-[140%] text-[#0C0900] font-[656]'>35%</h4>
                <span className='text-[#0C0900] font-semibold'>Increase lead capture</span>
              </div>
              <div className="space-y-2 bg-[#F6F6F6] p-4 rounded-lg text-center ">
                <h4 className='text-[32px] leading-[140%] text-[#0C0900] font-[656]'>45%</h4>
                <span className='text-[#0C0900] font-semibold'>Reduce support load</span>
              </div>
              <div className="space-y-2 bg-[#F6F6F6] p-4 rounded-lg text-center ">
                <h4 className='text-[32px] leading-[140%] text-[#0C0900] font-[656]'>2×</h4>
                <span className='text-[#0C0900] font-semibold'> Guided conversions</span>
              </div>
              <div className="space-y-2 bg-[#F6F6F6] p-4 rounded-lg text-center ">
                <h4 className='text-[32px] leading-[140%] text-[#0C0900] font-[656]'>100%</h4>
                <span className='text-[#0C0900] font-semibold'>Performance tracking</span>
              </div>
            </div>
            <Button type="primary">Build your agent now</Button>
          </div>

        </div>
      </div>
    </section>
  );
}
