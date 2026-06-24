import { ArrowRight } from 'lucide-react';
import Cookies from 'js-cookie';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserMenu from './UserMenu';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/contact', label: 'Contact' },
];

const Header = () => {
  const token = Cookies.get('kotha_token');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/assets/logo/Logo.svg"
              alt="Virtix AI"
              className="h-7 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 rounded-full bg-[#0C0900]/[0.04] px-1.5 py-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-white text-[#0C0900] shadow-sm'
                    : 'text-[#0C0900]/60 hover:text-[#0C0900] hover:bg-white/60'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {token ? (
              <UserMenu />
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/signin"
                  className="px-4 py-1.5 text-sm font-medium text-[#0C0900]/70 hover:text-[#0C0900] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#6200FF] text-white text-sm font-semibold hover:bg-[#5000CC] transition-colors"
                >
                  Get started <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[#0C0900]/60 hover:bg-[#0C0900]/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container pb-4">
          <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-lg p-3 space-y-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-[#6200FF]/5 text-[#6200FF]'
                    : 'text-[#0C0900]/70 hover:bg-[#0C0900]/[0.03]'
                }`}
              >
                {label}
              </Link>
            ))}
            {!token && (
              <div className="flex gap-2 pt-2 border-t border-[#E5E7EB] mt-2">
                <Link
                  to="/signin"
                  className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium text-[#0C0900]/70 border border-[#E5E7EB] hover:bg-[#0C0900]/[0.03] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 text-center px-4 py-2.5 rounded-xl bg-[#6200FF] text-white text-sm font-semibold hover:bg-[#5000CC] transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
