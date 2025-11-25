import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer bg-[#1a1a1a] text-white">
      <div className="md:w-3xl flex justify-between items-center flex-col gap-6 mx-auto py-20">
        <div className="footer-content space-y-6">
          <div className="footer-brand mx-auto space-y-6">
            <div className="logo ">
              <img src="/assets/logo/LogoWhite.png" alt="Virtis AI" className="w-[120px] h-[40px] mx-auto" />
            </div>
            <p className="footer-description text-center">
              Unleash enterprise-grade AI agents to instantly engage, qualify, & convert inbound leads into pipeline & revenue.
            </p>
          </div>
          <div className="flex flex-row gap-6 justify-center items-center ">
            <Link href="/" className="footer-link">Home</Link>
            <Link href="/" className="footer-link">Feature</Link>
            <Link href="/" className="footer-link">Price</Link>
            <Link href="/" className="footer-link">Contact</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Virtis AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;