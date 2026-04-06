import { FacebookFilled, InstagramFilled, LinkedinFilled, XOutlined, YoutubeFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M16.37 2H13.7v10.79a2.8 2.8 0 1 1-2.8-2.8c.28 0 .55.04.8.12V7.39a5.5 5.5 0 1 0 4.67 5.4V7.06c1.08.78 2.41 1.24 3.83 1.27V5.66A4.75 4.75 0 0 1 16.37 2Z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="footer bg-[#111111] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] items-start">
          <div className="space-y-6">
            <img src="/assets/logo/Virtix_AI_Logo_White.png" alt="Virtix AI" className="h-10" />
            <p className="text-sm leading-relaxed text-white/70">
              Virtix AI is a conversation-first support platform that lets SMEs and enterprises handle chat, complaints,
              bookings, orders and leads with AI agents – without hiring a big support team.
            </p>
            <div className="flex items-center gap-4 text-white/70">
              <a href="https://x.com/tryvirtixai" target="_blank" rel="noreferrer" aria-label="Virtix AI on X" className="hover:text-white">
                <XOutlined className="text-base" />
              </a>
              <a href="https://www.linkedin.com/company/tryvirtixai" target="_blank" rel="noreferrer" aria-label="Virtix AI on LinkedIn" className="hover:text-white">
                <LinkedinFilled className="text-base" />
              </a>
              <a href="https://facebook.com/tryvirtixai" target="_blank" rel="noreferrer" aria-label="Virtix AI on Facebook" className="hover:text-white">
                <FacebookFilled className="text-base" />
              </a>
              <a href="https://www.instagram.com/tryvirtixai" target="_blank" rel="noreferrer" aria-label="Virtix AI on Instagram" className="hover:text-white">
                <InstagramFilled className="text-base" />
              </a>
              <a href="https://www.tiktok.com/@tryvirtixai" target="_blank" rel="noreferrer" aria-label="Virtix AI on TikTok" className="hover:text-white">
                <TikTokIcon />
              </a>
              <a href="https://www.youtube.com/@tryvirtixai" target="_blank" rel="noreferrer" aria-label="Virtix AI on YouTube" className="hover:text-white">
                <YoutubeFilled className="text-base" />
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 font-semibold">Company</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link to="/" className="text-white/70 hover:text-white">Home</Link>
              <Link to="/about" className="text-white/70 hover:text-white">About us</Link>
              
              <Link to="/features" className="text-white/70 hover:text-white">Feature</Link>
              <Link to="/terms" className="text-white/70 hover:text-white">Terms & Conditions</Link> 
              <Link to="/pricing" className="text-white/70 hover:text-white">Pricing</Link>
              <Link to="/privacy-policy" className="text-white/70 hover:text-white">Privacy Policy</Link> 
              <Link to="/contact" className="text-white/70 hover:text-white">Contact</Link>
              <Link to="/help-center" className="text-white/70 hover:text-white">Help Center</Link> 
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 Virtix AI. All rights reserved.</p>
          <p>Built to keep conversations moving.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
