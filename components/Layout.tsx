import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin, ChevronRight, Star, Loader2, CheckCircle, AlertCircle, Send, ExternalLink, Clock, Youtube } from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import ChatWidget from './ChatWidget';
import { Logo } from './Logo';
import { submitNewsletterSubscription } from '../services/n8nService';

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

  const socialLinks = [
    { icon: Facebook, href: COMPANY_INFO.facebook, label: 'Facebook' },
    { icon: Instagram, href: COMPANY_INFO.instagram, label: 'Instagram' },
    { icon: Youtube, href: COMPANY_INFO.youtube, label: 'YouTube' },
    { icon: Linkedin, href: COMPANY_INFO.linkedin, label: 'LinkedIn' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sticky top-0 z-50 w-full bg-white flex flex-col shadow-md transition-all duration-300">
      {/* --- TOP HEADER (Logo + Contacts) --- */}
      <div className="border-b border-gray-100 bg-white py-2 lg:py-4 hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center flex-shrink-0">
            {/* Using the logo component but ensuring it fits the new layout */}
            <Logo className="h-12 lg:h-16" variant="horizontal" />
          </Link>

          {/* Contact Info Section (Right aligned) */}
          <div className="flex items-center gap-6">
            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded flex items-center justify-center">
                <Mail size={16} className="text-gray-600" />
              </div>
              <a href={`mailto:${COMPANY_INFO.email}`} className="text-[#0ea5e9] font-medium text-sm hover:underline">
                {COMPANY_INFO.email}
              </a>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded flex items-center justify-center">
                {/* Whatsapp icon usually represented by Phone or explicit SVG. Using MessageCircle/Phone for now as lucide doesn't have Whatsapp brand icon built-in without extension, 
                      but user asked to duplicate design. Assuming standard icons. */}
                <Phone size={16} className="text-gray-600" />
              </div>
              <span className="text-[#0ea5e9] font-medium text-sm">+254 797 331 355</span>
            </div>

            {/* Sales Line */}
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded flex items-center justify-center">
                <Phone size={16} className="text-gray-600" />
              </div>
              <span className="text-[#0ea5e9] font-medium text-sm">+254 727 774 279</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION BAR (Links + Socials) --- */}
      <nav className="bg-white z-50 border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-16 lg:h-20">

            {/* Mobile Logo (Visible only on mobile/tablet when Top Header is hidden) */}
            <div className="lg:hidden flex items-center">
              <Link to="/">
                <Logo className="h-10" variant="horizontal" />
              </Link>
            </div>

            {/* Desktop Navigation Links (Left/Center aligned) */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-bold tracking-wide py-2 border-b-2 transition-all duration-200 ${isActive(link.path)
                    ? 'text-slate-900 border-[#0ea5e9]'
                    : 'text-slate-700 border-transparent hover:text-[#0ea5e9]'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Social Icons (Right aligned, desktop only) */}
            <div className="hidden lg:flex items-center gap-4 border-l border-gray-200 pl-6 ml-6 h-8">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-800 hover:text-[#0ea5e9] transition-colors"
                >
                  <social.icon size={18} />
                </a>
              ))}
              {/* TikTok placeholder if needed, using custom text or icon */}
              {/* <span className="text-xs font-bold text-red-500">TikTok</span> */}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-brand-900 p-2"
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 animate-fade-in-up">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-bold ${isActive(link.path) ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-gray-50'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-100 flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-[#0ea5e9]"
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
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
      // Submit newsletter subscription to n8n webhook
      // n8n will handle this and connect to info@provisionlands.co.ke
      const result = await submitNewsletterSubscription(email);

      if (result.success) {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        setEmail('');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        throw new Error(result.error || 'Subscription failed');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
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
          You've been added to our list.
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
          placeholder="Enter your email"
          className={`w-full bg-white/5 border ${status === 'error' ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-brand-500'
            } rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm`}
          aria-label="Email Address for Newsletter"
        />
        {status === 'loading' && (
          <div className="absolute right-3 top-3">
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
        className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-brand-900/20"
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        {!status && <Send size={16} />}
      </button>
    </form>
  );
};

const Footer: React.FC = () => {
  // Navigation links for schema and rendering
  const keyLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Our Properties', path: '/properties' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'News & Insights', path: '/news' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
  ];

  const socialLinks = [
    { icon: Facebook, href: COMPANY_INFO.facebook, label: 'Facebook' },
    { icon: Instagram, href: COMPANY_INFO.instagram, label: 'Instagram' },
    { icon: Youtube, href: COMPANY_INFO.youtube, label: 'YouTube' },
    { icon: Linkedin, href: COMPANY_INFO.linkedin, label: 'LinkedIn' },
  ];

  // Generate schema for navigation
  const navigationSchema = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "name": "Footer Navigation",
    "url": "https://provisionlands.co.ke",
    "hasPart": keyLinks.map(link => ({
      "@type": "SiteNavigationElement",
      "name": link.name,
      "url": `https://provisionlands.co.ke${link.path}`
    }))
  };

  return (
    <footer className="bg-[#0B1120] text-white pt-20 pb-10 border-t border-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand Column (Col 1-4) */}
          <div className="lg:col-span-4">
            <div className="mb-6">
              <Logo variant="full" className="h-16" />
            </div>
            <p className="text-slate-400 mb-8 leading-relaxed max-w-sm">
              We promise and deliver genuinely. Your trusted partner in acquiring prime, value-added land with ready title deeds in Kenya.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-brand-600 hover:text-white transition-all duration-300 hover:-translate-y-1"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links (Col 5-7) */}
          <div className="lg:col-span-3 lg:pl-8">
            <h3 className="text-lg font-serif font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {keyLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight size={14} className="text-brand-600 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info (Col 8-10) */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-serif font-bold text-white mb-6">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 group">
                <div className="bg-slate-800 p-2.5 rounded-lg text-brand-500 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-semibold mb-1">Visit Us</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{COMPANY_INFO.address}</p>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="bg-slate-800 p-2.5 rounded-lg text-brand-500 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-semibold mb-1">Call Us</h4>
                  <a href={`tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`} className="text-slate-400 text-sm hover:text-white transition-colors block">
                    {COMPANY_INFO.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="bg-slate-800 p-2.5 rounded-lg text-brand-500 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-semibold mb-1">Email Us</h4>
                  <a href={`mailto:${COMPANY_INFO.email}`} className="text-slate-400 text-sm hover:text-white transition-colors block">
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="bg-slate-800 p-2.5 rounded-lg text-brand-500 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-semibold mb-1">Hours</h4>
                  <p className="text-slate-400 text-xs">Mon-Fri: 7am-6pm</p>
                  <p className="text-slate-400 text-xs">Sat: 8am-5pm</p>
                  <p className="text-slate-400 text-xs">Sun: On call</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter (Col 11-12) */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-serif font-bold text-white mb-6">Newsletter</h3>
            <p className="text-slate-400 text-sm mb-4">
              Subscribe to get the latest property news and market updates.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} <span className="text-slate-300">Provision Land & Properties Ltd</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-slate-500 hover:text-brand-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

const WhatsAppButton: React.FC = () => (
  <a
    href={COMPANY_INFO.whatsappLink}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group animate-fade-in-up"
    aria-label="Chat on WhatsApp"
  >
    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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