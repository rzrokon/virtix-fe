import { FacebookFilled, InstagramFilled, LinkedinFilled, XOutlined, YoutubeFilled } from "@ant-design/icons";
import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M16.37 2H13.7v10.79a2.8 2.8 0 1 1-2.8-2.8c.28 0 .55.04.8.12V7.39a5.5 5.5 0 1 0 4.67 5.4V7.06c1.08.78 2.41 1.24 3.83 1.27V5.66A4.75 4.75 0 0 1 16.37 2Z" />
  </svg>
);

// Simple SVG payment icons
const VisaIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="Visa">
    <rect width="48" height="32" rx="4" fill="#1A1F71" />
    <text x="50%" y="22" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="1">VISA</text>
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="Mastercard">
    <rect width="48" height="32" rx="4" fill="#252525" />
    <circle cx="19" cy="16" r="9" fill="#EB001B" />
    <circle cx="29" cy="16" r="9" fill="#F79E1B" />
    <path d="M24 9.5a9 9 0 0 1 0 13 9 9 0 0 1 0-13Z" fill="#FF5F00" />
  </svg>
);

const DiscoverIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="Discover">
    <rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb" strokeWidth="1" />
    <text x="9" y="21" fill="#231F20" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">DISCOVER</text>
    <circle cx="38" cy="16" r="7" fill="#F76F20" />
  </svg>
);

const AmexIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="American Express">
    <rect width="48" height="32" rx="4" fill="#2557D6" />
    <text x="50%" y="21" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="0.5">AMERICAN</text>
    <text x="50%" y="28" textAnchor="middle" fill="white" fontSize="7" fontFamily="Arial, sans-serif" letterSpacing="0.5">EXPRESS</text>
  </svg>
);

const PayPalIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="PayPal">
    <rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb" strokeWidth="1" />
    <text x="50%" y="21" textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="Arial, sans-serif">
      <tspan fill="#003087">Pay</tspan><tspan fill="#009CDE">Pal</tspan>
    </text>
  </svg>
);

const Footer = () => {
  return (
    <footer className="footer bg-[#111111] text-white">
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.5fr_0.9fr_0.9fr_1fr] items-start">
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
            <div className="space-y-3 text-sm">
              <Link to="/" className="block text-white/70 hover:text-white">Home</Link>
              <Link to="/about" className="block text-white/70 hover:text-white">About us</Link>
              <Link to="/features" className="block text-white/70 hover:text-white">Feature</Link>
              <Link to="/pricing" className="block text-white/70 hover:text-white">Pricing</Link>
              <Link to="/contact" className="block text-white/70 hover:text-white">Contact</Link>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 font-semibold">Resources</p>
            <div className="space-y-3 text-sm">
              <Link to="/terms" className="block text-white/70 hover:text-white">Terms & Conditions</Link>
              <Link to="/privacy-policy" className="block text-white/70 hover:text-white">Privacy Policy</Link>
              <Link to="/refund-policy" className="block text-white/70 hover:text-white">Refund Policy</Link>
              <Link to="/help-center" className="block text-white/70 hover:text-white">Help Center</Link>
              <Link to="/partners" className="block text-white/70 hover:text-white">Become a Partner</Link>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 font-semibold">Address</p>
            <div className="text-sm leading-7 text-white/70">
              <p>1209 MOUNTAIN ROAD PL NE</p>
              <p>STE R, ALBUQUERQUE</p>
              <p>New Mexico 87110, USA</p>
            </div>
            <div className="space-y-2 text-sm text-white/70 pt-2">
              <a href="mailto:info@virtixai.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={14} />
                info@virtixai.com
              </a>
              <a href="tel:+15055282615" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={14} />
                +1 (505) 528-2615
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/60">&copy; 2026 Virtix AI. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <VisaIcon />
            <MastercardIcon />
            <DiscoverIcon />
            <AmexIcon />
            <PayPalIcon />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
