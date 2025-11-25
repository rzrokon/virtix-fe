import { Button } from 'antd';

const Hero = () => {
  return (
    <section className="hero-section pt-40 pb-20">
      <div className="container ">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-2 space-y-4">
            <h1 className="text-6xl leading-[120%] text-[#0C0900] font-semibold">
              Clean, Apable AI Agent in a Few Clicks
            </h1>
            <p className="font-normal text-2xl leading-relaxed text-gray-600">
              Create an agent, set options, add questions, upload docs and index. Your agent then guides purchases, explains pricing, promotes offers, books appointments, and logs complaints 24/7.
            </p>
            <div className="flex items-center gap-4">
              <Button type="primary">Try for free</Button>
              <Button>Book a demo</Button>
            </div>
            <div className="mt-10">
              <p className='text-[24px] leading-[140%] text-[#444444] font-bold'>Trusted by</p>
              <div className="flex items-center justify-between">
                <div>
                  <img src="/assets/images/slack.png" alt="slack" />
                </div>
                <div>
                  <img src="/assets/images/zoom.png" alt="zoom" />
                </div>
                <div>
                  <img src="/assets/images/asana.png" alt="asana" />
                </div>
                <div>
                  <img src="/assets/images/gumroad.png" alt="outreach" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <img src="/assets/images/image-1.png" alt="hero" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;