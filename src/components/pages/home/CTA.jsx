import { Button } from 'antd';

const CTA = () => {
  return (
    <section className="cta py-20">
      <div className="container bg-[#6200FF] rounded-4xl">
        <div className="cta-content text-white py-[60px] px-[100px] space-y-6 text-center">
          <h2 className="text-[52px] leading-[120%] text-center font-extrabold">
            Make customer experience your competitive edge
          </h2>

          <p className="text-lg leading-[160%] text-center font-semibold">
            Use VIRTIX AI to deliver faster, smarter, and more consistent customer interactions — without increasing headcount.
          </p>

          <Button className="md:w-[280px]" size="large">
            Start free — no credit card
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;