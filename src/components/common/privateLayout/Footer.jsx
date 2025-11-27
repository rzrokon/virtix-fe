import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer bg-[#1a1a1a] text-white">
      <div className="md:w-3xl flex justify-between items-center flex-col gap-6 mx-auto py-20">
        <div className="footer-content space-y-6">
          <div className="footer-brand mx-auto space-y-6">
            <div className="logo ">
              <img src="/assets/logo/Virtix_AI_Logo_White.png" alt="Virtis AI" className="h-[40px] mx-auto" />
            </div>
            <p className="footer-description text-center">
              Virtix AI is a conversation-first support platform that lets SMEs and enterprises handle chat, complaints, bookings, orders, and leads with AI agents – without hiring a big support team.
            </p>
          </div>
          <div className="flex flex-row gap-6 justify-center items-center ">
            <Link href="/" className="footer-link">Home</Link>
            <Link href="/features" className="footer-link">Feature</Link>
            <Link href="/pricing" className="footer-link">Priceing</Link>
            <Link href="/contact" className="footer-link">Contact</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Virtix AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;