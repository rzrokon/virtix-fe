import { Modal } from 'antd';
import { ArrowRight, Facebook, Globe, Instagram, MessageCircle, Phone, Play } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const youtubeEmbedUrl = 'https://www.youtube.com/embed/IZcjJMuH86w?autoplay=1&rel=0';

  return (
    <section className="hero-section pt-40 pb-20">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Left: copy */}
          <div className="flex-2 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E6E6] bg-[#F8F7FF] px-4 py-1.5 text-sm font-semibold text-[#6200FF]">
              <span className="h-2 w-2 rounded-full bg-[#6200FF] animate-pulse" />
              Built for Shopify &amp; WooCommerce stores
            </div>

            <h1 className="text-5xl leading-[120%] text-[#0C0900] font-bold">
              AI Sales &amp; Support Agent for Shopify &amp; WooCommerce Stores
            </h1>

            <p className="font-normal text-xl leading-relaxed text-gray-600 max-w-xl">
              Virtix AI helps Shopify and WooCommerce stores answer product questions, recommend products, track orders, and support customers 24/7.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-[#6200FF] px-7 py-3.5 text-base font-semibold text-white hover:bg-[#5000CC] transition-colors shadow-[0_4px_20px_rgba(98,0,255,0.35)]"
              >
                Start Free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 hover:border-[#6200FF]/30 hover:text-[#6200FF] transition-colors"
              >
                Book Demo
              </Link>
            </div>

            <p className="text-sm text-gray-400">
              No credit card required · Setup in under 5 minutes
            </p>

            <div className="pt-2">
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
                    className="group inline-flex items-center gap-2 rounded-full border border-[#E6E6E6] bg-[#F8F7FF] px-4 py-2 text-sm font-semibold text-[#0C0900] shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#D8CCFF] hover:shadow-[0_14px_28px_rgba(98,0,255,0.2)]"
                  >
                    <channel.Icon
                      size={16}
                      className={`${channel.color} transition-transform duration-300 ease-out group-hover:scale-110`}
                    />
                    {channel.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: product visual */}
          <div className="flex-1">
            <div className="relative">
              <img
                src="/assets/images/virtix-widget.png"
                alt="Virtix AI website widget"
                className="w-full rounded-2xl"
              />

              {/* Play button — covers entire image so clicking anywhere opens the video */}
              <button
                type="button"
                aria-label="Play product video"
                onClick={() => setVideoOpen(true)}
                className="absolute inset-0 z-10 flex items-center justify-center group"
              >
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#6200FF] shadow-xl group-hover:scale-110 transition-transform">
                  <Play size={22} className="ml-1" fill="currentColor" />
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
        destroyOnHidden
      >
        <div className="aspect-video w-full">
          {videoOpen ? (
            <iframe
              className="h-full w-full rounded-lg"
              src={youtubeEmbedUrl}
              title="Virtix AI product video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : null}
        </div>
      </Modal>
    </section>
  );
};

export default Hero;
