import { Modal } from 'antd';
import { ArrowRight, Facebook, Globe, Instagram, MessageCircle, Play, ShieldCheck, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const channels = [
  { label: 'Website Widget', color: 'text-[#6200FF]', Icon: Globe },
  { label: 'Facebook', color: 'text-[#1877F2]', Icon: Facebook },
  { label: 'Messenger', color: 'text-[#00B2FF]', Icon: MessageCircle },
  { label: 'Instagram', color: 'text-[#E1306C]', Icon: Instagram },
];

const Hero = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const youtubeEmbedUrl = 'https://www.youtube.com/embed/IZcjJMuH86w?autoplay=1&rel=0';

  return (
    <section className="relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(98,0,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="container relative pt-16 pb-20 sm:pt-20 sm:pb-24">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-14 items-center">

          {/* Left — content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6200FF]/15 bg-white/70 backdrop-blur px-4 py-1.5 text-sm font-semibold text-[#6200FF] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#6200FF] animate-pulse" />
              Built for Shopify &amp; WooCommerce stores
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] leading-[115%] text-[#0C0900] font-bold tracking-tight">
              Your AI Sales &amp; Support Agent That Never Sleeps
            </h1>

            <p className="text-lg leading-relaxed text-[#0C0900]/60 max-w-lg">
              Answer product questions, recommend items, process orders, and support customers 24/7 — across every channel.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#6200FF] px-7 py-3.5 text-base font-semibold text-white hover:bg-[#5000CC] transition-all shadow-[0_4px_24px_rgba(98,0,255,0.3)] hover:shadow-[0_6px_32px_rgba(98,0,255,0.4)]"
              >
                Start Free <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => setVideoOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-6 py-3.5 text-base font-semibold text-[#0C0900] hover:border-[#6200FF]/30 hover:text-[#6200FF] transition-colors"
              >
                <Play size={16} fill="currentColor" className="opacity-60" />
                Watch Demo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#0C0900]/45">
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-[#6200FF]/60" />
                Setup in under 5 minutes
              </span>
              <span className="hidden sm:inline text-[#0C0900]/20">|</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#6200FF]/60" />
                No credit card required
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {channels.map((ch) => (
                <span
                  key={ch.label}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-sm font-medium text-[#0C0900] shadow-sm hover:-translate-y-0.5 transition-transform"
                >
                  <ch.Icon size={14} className={ch.color} />
                  {ch.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — product visual */}
          <div className="relative flex items-center justify-center">
            <div className="inline-block rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
              <div className="relative rounded-xl overflow-hidden h-[520px]">
                <img
                  src="/assets/images/virtix-widget.png"
                  alt="Virtix AI website widget"
                  className="h-full w-auto block"
                />
                <button
                  type="button"
                  aria-label="Play product video"
                  onClick={() => setVideoOpen(true)}
                  className="absolute inset-0 z-10 flex items-center justify-center group bg-black/5 hover:bg-black/10 transition-colors"
                >
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#6200FF] shadow-xl group-hover:scale-110 transition-transform">
                    <Play size={22} className="ml-1" fill="currentColor" />
                  </span>
                </button>
              </div>
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
          {videoOpen && (
            <iframe
              className="h-full w-full rounded-lg"
              src={youtubeEmbedUrl}
              title="Virtix AI product video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    </section>
  );
};

export default Hero;
