import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin, ChevronRight, Star, Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import ChatWidget from './ChatWidget';
import { Logo } from './Logo';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Properties', path: '/properties' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center">
              <Logo className="h-12 md:h-14 lg:h-16" variant="horizontal" />
            </Link>
          </div>

          {/* Desktop Menu - Optimized for Tablet (md) and Desktop (lg) */}
          <div className="hidden md:flex items-center md:space-x-3 lg:space-x-8 flex-nowrap overflow-x-auto no-scrollbar">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                  isActive(link.path) ? 'text-brand-600 font-bold border-b-2 border-brand-500' : 'text-gray-600 hover:text-brand-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/contact" 
              className="bg-accent-500 hover:bg-accent-600 text-white md:px-4 lg:px-6 py-2 rounded-full font-medium transition text-sm shadow-lg shadow-accent-500/30 whitespace-nowrap flex-shrink-0"
            >
              Get Quote
            </Link>
          </div>

          {/* Mobile button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-brand-900 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in-up">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path) ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/contact" 
              onClick={() => setIsOpen(false)}
              className="block mt-4 text-center bg-accent-500 text-white px-3 py-3 rounded-md font-bold shadow-md"
            >
              Get Quote
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Email address is required.');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('success');
      setMessage('Thank you for subscribing!');
      setEmail('');
      
      // Auto-reset form after 5 seconds to allow another subscription if needed
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 animate-fade-in-up">
        <div className="flex items-center gap-3 text-green-400 mb-1">
          <CheckCircle size={20} />
          <span className="font-bold">Subscribed!</span>
        </div>
        <p className="text-slate-400 text-sm pl-8">
          You've been added to our newsletter list.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="relative">
        <input 
          type="email" 
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          disabled={status === 'loading'}
          placeholder="Your email address" 
          className={`w-full bg-slate-800 border ${
            status === 'error' ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-brand-500'
          } rounded px-4 py-2 pr-10 text-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Email Address for Newsletter"
        />
        {status === 'loading' && (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="animate-spin text-slate-400" size={18} />
          </div>
        )}
      </div>
      
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-400 text-xs animate-fade-in-up">
          <AlertCircle size={14} />
          <span>{message}</span>
        </div>
      )}

      <button 
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium py-2 rounded transition flex items-center justify-center gap-2"
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        {!status && <Send size={16} />}
      </button>
    </form>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-6 bg-white p-4 rounded-lg inline-block w-full max-w-[250px]">
               <Logo variant="full" className="h-16" />
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              {COMPANY_INFO.slogan}. We deliver prime value land and properties with integrity and speed.
            </p>
            <div className="flex items-center gap-1 text-yellow-500 mb-6">
               <Star className="fill-current" size={16} />
               <Star className="fill-current" size={16} />
               <Star className="fill-current" size={16} />
               <Star className="fill-current" size={16} />
               <Star className="fill-current" size={16} />
               <span className="text-slate-400 text-sm ml-2">(300+ Reviews)</span>
            </div>
            <div className="flex space-x-4">
              <a href={COMPANY_INFO.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-accent-500 transition"><Facebook size={20} /></a>
              <a href={COMPANY_INFO.twitter} className="text-slate-400 hover:text-accent-500 transition"><Twitter size={20} /></a>
              <a href={COMPANY_INFO.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-accent-500 transition"><Instagram size={20} /></a>
              <a href={COMPANY_INFO.linkedin} className="text-slate-400 hover:text-accent-500 transition"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-slate-700 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-slate-300 hover:text-accent-500 flex items-center gap-2 transition"><ChevronRight size={14} /> About Us</Link></li>
              <li><Link to="/properties" className="text-slate-300 hover:text-accent-500 flex items-center gap-2 transition"><ChevronRight size={14} /> Listings</Link></li>
              <li><Link to="/services" className="text-slate-300 hover:text-accent-500 flex items-center gap-2 transition"><ChevronRight size={14} /> Our Services</Link></li>
              <li><Link to="/portfolio" className="text-slate-300 hover:text-accent-500 flex items-center gap-2 transition"><ChevronRight size={14} /> Success Stories</Link></li>
              <li><Link to="/contact" className="text-slate-300 hover:text-accent-500 flex items-center gap-2 transition"><ChevronRight size={14} /> Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-slate-700 pb-2 inline-block">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-300">
                <MapPin className="text-accent-500 mt-1 shrink-0" size={18} />
                <span className="text-sm">{COMPANY_INFO.address}</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Phone className="text-accent-500 shrink-0" size={18} />
                <span>{COMPANY_INFO.phone}</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <Mail className="text-accent-500 shrink-0 mt-1" size={18} />
                <div className="flex flex-col text-sm">
                  <span>{COMPANY_INFO.email}</span>
                  <span>{COMPANY_INFO.secondaryEmail}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-slate-700 pb-2 inline-block">Newsletter</h3>
            <p className="text-slate-400 mb-4 text-sm">Subscribe to get the latest property alerts and market news.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Provision Land & Properties Ltd. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const WhatsAppButton: React.FC = () => (
  <a
    href="https://wa.me/254797331355"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group animate-fade-in-up"
    aria-label="Chat on WhatsApp"
  >
     <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
     </svg>
  </a>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </div>
  );
};