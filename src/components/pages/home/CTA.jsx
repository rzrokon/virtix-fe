import { Button } from 'antd';

const CTA = () => {
  return (
    <section className="cta py-20">
      <div className="container bg-[#6200FF] rounded-4xl">
        <div className="cta-content text-white py-[60px] px-[100px] space-y-6  text-center">
          <h2 className="text-[52px] leading-[120%] text-center font-extrabold">
            Make customer experience your competitive edge
          </h2>
          <p className="text-lg leading-[160%] text-center font-semibold">
            Use Chatbase to deliver exceptional support experiences that set you apart from the competition.
          </p>
          <Button className="md:w-[250px] " size='large'>Get started</Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;