import { Button } from 'antd';

export default function AiDrives() {
  return (
    <section className="customer-interactions py-20">
      <div className="container">
        <div className="flex md:flex-row flex-col items-center justify-center gap-8">
          <div className="flex-1">
            <img src="/assets/images/Home/image-5.png" alt="Customer Interactions" className="w-full h-auto" />
          </div>

          <div className="flex-1 space-y-4">
            <h2 className="text-6xl leading-[120%] text-[#0C0900] font-bold">
              AI that drives growth — without extra headcount
            </h2>

            <p className="font-normal text-base leading-[140%] text-[#0C0900]">
              Turn every chat into an opportunity. Capture leads, guide purchases, and reduce repetitive support work —
              while keeping full visibility into performance.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 bg-[#F6F6F6] p-4 rounded-lg text-center">
                <h4 className="text-[32px] leading-[140%] text-[#0C0900] font-[656]">35%</h4>
                <span className="text-[#0C0900] font-semibold">Up to more leads</span>
              </div>

              <div className="space-y-2 bg-[#F6F6F6] p-4 rounded-lg text-center">
                <h4 className="text-[32px] leading-[140%] text-[#0C0900] font-[656]">45%</h4>
                <span className="text-[#0C0900] font-semibold">Up to less support load</span>
              </div>

              <div className="space-y-2 bg-[#F6F6F6] p-4 rounded-lg text-center">
                <h4 className="text-[32px] leading-[140%] text-[#0C0900] font-[656]">2×</h4>
                <span className="text-[#0C0900] font-semibold">More guided conversations</span>
              </div>

              <div className="space-y-2 bg-[#F6F6F6] p-4 rounded-lg text-center">
                <h4 className="text-[32px] leading-[140%] text-[#0C0900] font-[656]">100%</h4>
                <span className="text-[#0C0900] font-semibold">Conversation visibility</span>
              </div>
            </div>

            <p className="text-xs text-gray-500">Metrics are indicative and may vary by business, traffic, and setup.</p>

            <Button type="primary">Build your agent now</Button>
          </div>
        </div>
      </div>
    </section>
  );
}