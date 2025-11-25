import { Button } from 'antd';

const Hero = () => {
  return (
    <section className="hero-section pt-40">
      <div className="container ">
        <div className="md:w-3xl space-y-4 text-center mx-auto">
          <h1 className="text-6xl leading-[120%] text-[#0C0900] font-semibold">
            Supercharge customer service with AI Agent
          </h1>
          <p className="font-normal text-2xl leading-relaxed text-gray-600">
            Unlock the full potential of your customer service with our AI-powered agent. Streamline interactions, boost efficiency, and deliver exceptional customer experiences.
          </p>
          <div className="flex items-center gap-4 justify-center">
            <Button type="primary">Try for free</Button>
            <Button>Try for free</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;