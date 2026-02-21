import { Button, Modal } from 'antd';
import { Facebook, Globe, Instagram, MessageCircle, Phone, Play } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="hero-section pt-40 pb-20">
      <div className="container ">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-2 space-y-4">
            <h1 className="text-5xl leading-[120%] text-[#0C0900] font-semibold">
              One AI agent to handle sales, support and bookings — 24/7
            </h1>

            <p className="font-normal text-xl leading-relaxed text-gray-600">
              Virtix AI handles sales questions, captures leads, books appointments, and manages support 24/7 — without growing your team.
            </p>


            <p className="font-normal text-xl leading-relaxed text-[#0C0900]">
              Stop missing leads. Stop repeating answers. Start scaling conversations.
            </p>

            <div className="flex items-center gap-4 mt-10">
              <Link to="/signin">
                <Button type="primary">Start free — no credit card</Button>
              </Link>
              <Link to="/contact">
                <Button>Book a demo</Button>
              </Link>
            </div>

            <div className="mt-10 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { label: 'Website Widget', color: 'text-[#6200FF]', Icon: Globe },
                  { label: 'Facebook', color: 'text-[#1877F2]', Icon: Facebook },
                  { label: 'Messenger', color: 'text-[#00B2FF]', Icon: MessageCircle },
                  { label: 'Instagram', color: 'text-[#E1306C]', Icon: Instagram },
                  { label: 'WhatsApp', color: 'text-[#25D366]', Icon: Phone },
                ].map((channel) => (
                  <span
                    key={channel.label}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E6E6E6] bg-[#F8F7FF] px-4 py-2 text-sm font-semibold text-[#0C0900] shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                  >
                    <channel.Icon size={16} className={channel.color} />
                    {channel.label}
                  </span>
                ))}
              </div>
          
            </div>
          </div>

          <div className="flex-1">
            <div className="relative">
              <img src="/assets/images/image-1.png" alt="hero" />
              <button
                type="button"
                aria-label="Play product video"
                onClick={() => setVideoOpen(true)}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[#0C0900] shadow-lg">
                  <Play size={22} className="ml-0.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={videoOpen}
        footer={null}
        onCancel={() => setVideoOpen(false)}
        width={900}
        centered
      >
        <div className="aspect-video w-full">
          <video
            className="h-full w-full rounded-lg"
            controls
            autoPlay
            poster="/assets/images/image-1.png"
          >
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
          </video>
        </div>
      </Modal>
    </section>
  );
};

export default Hero;
