import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { COMPANY_INFO } from '../constants';
import { MapPin, Phone, Mail, Clock, Send, Star, Loader2, Navigation2, ExternalLink } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation: Check for empty or whitespace-only strings
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim() || !formData.phone.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    setStatus('submitting');

    // Simulate API call with Promise
    new Promise(resolve => setTimeout(resolve, 1500))
      .then(() => {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        // Reset status after 5 seconds
        setTimeout(() => setStatus('idle'), 5000);
      })
      .catch(() => setStatus('error'));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Contact Us - Provision Land Limited | Thika Office</title>
        <meta name="description" content="Get in touch with Provision Land Limited for inquiries about land for sale, site visits, and property management. Visit us at Clairbourn Towers, Thika." />
        <link rel="canonical" href="https://provisionlands.co.ke/contact" />

        {/* Schema.org JSON-LD for Contact Page */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "ContactPage",
                "@id": "https://provisionlands.co.ke/contact#webpage",
                "url": "https://provisionlands.co.ke/contact",
                "name": "Contact Us - Provision Land Limited",
                "description": "Get in touch with Provision Land Limited for inquiries about land for sale, site visits, and property management.",
                "isPartOf": {"@id": "https://provisionlands.co.ke/#website"},
                "about": {"@id": "https://provisionlands.co.ke/#organization"}
              },
              {
                "@type": "LocalBusiness",
                "@id": "https://provisionlands.co.ke/#localbusiness",
                "name": "Provision Land & Properties Ltd",
                "image": "https://provisionlands.co.ke/web-app-manifest-512x512.png",
                "url": "https://provisionlands.co.ke",
                "telephone": "+254797331355",
                "email": "info@provisionlands.co.ke",
                "priceRange": "KES 200,000 - KES 7,500,000",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Clairbourn Towers, 5th Floor",
                  "addressLocality": "Thika",
                  "addressRegion": "Kiambu County",
                  "postalCode": "01000",
                  "addressCountry": "KE"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": -1.035323,
                  "longitude": 37.074561
                },
                "openingHoursSpecification": [
                  {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    "opens": "07:00",
                    "closes": "18:00"
                  },
                  {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": "Saturday",
                    "opens": "08:00",
                    "closes": "17:00"
                  },
                  {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": "Sunday",
                    "description": "On call as per request"
                  }
                ],
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "5",
                  "bestRating": "5",
                  "worstRating": "1",
                  "ratingCount": "300"
                },
                "contactPoint": [
                  {
                    "@type": "ContactPoint",
                    "telephone": "+254797331355",
                    "contactType": "customer service",
                    "areaServed": "KE",
                    "availableLanguage": ["English", "Swahili"]
                  },
                  {
                    "@type": "ContactPoint",
                    "telephone": "+254727774279",
                    "contactType": "sales",
                    "areaServed": "KE",
                    "availableLanguage": ["English", "Swahili"]
                  }
                ],
                "sameAs": [
                  "https://web.facebook.com/p/Provision-Land-Properties-Ltd-61551485047029/",
                  "https://www.instagram.com/provision_land_properties_ltd/"
                ]
              }
            ]
          }
        `}</script>
      </Helmet>
      {/* Header */}
      <div className="relative bg-brand-900 text-white py-20 overflow-hidden text-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover opacity-20" alt="Provision Land Background" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-serif font-bold mb-2">Contact Us</h1>
          <p className="text-brand-200">We Promise and Deliver Genuinely.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Contact Info */}
          <div className="bg-brand-600 text-white p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8 bg-black/20 backdrop-blur-sm p-2 rounded-lg w-fit border border-white/10">
                <div className="flex text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <span className="text-xs font-medium text-white">5 Star Rated (300+ Reviews)</span>
              </div>

              <h2 className="text-2xl font-serif font-bold mb-8">Visit Our Office</h2>

              <div className="space-y-8">
                <div className="flex items-start gap-4 group">
                  <div className="bg-white/10 p-3 rounded-lg group-hover:bg-accent-500 transition duration-300"><MapPin size={24} /></div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Our Location</h3>
                    <p className="text-brand-50">{COMPANY_INFO.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="bg-white/10 p-3 rounded-lg group-hover:bg-accent-500 transition duration-300"><Phone size={24} /></div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Phone Number</h3>
                    <p className="text-brand-50">{COMPANY_INFO.phone}</p>
                    <p className="text-brand-100 mt-1 text-sm">0727 774 279 (Sales)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="bg-white/10 p-3 rounded-lg group-hover:bg-accent-500 transition duration-300"><Mail size={24} /></div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email Address</h3>
                    <p className="text-brand-50">{COMPANY_INFO.email}</p>
                    <p className="text-brand-100 mt-1 text-sm">{COMPANY_INFO.secondaryEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="bg-white/10 p-3 rounded-lg group-hover:bg-accent-500 transition duration-300"><Clock size={24} /></div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Office Hours</h3>
                    <p className="text-brand-50">{COMPANY_INFO.businessHours.weekdays}</p>
                    <p className="text-brand-100 text-sm mt-1">{COMPANY_INFO.businessHours.saturday}</p>
                    <p className="text-brand-100 text-sm mt-1">{COMPANY_INFO.businessHours.sunday}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
              <p className="text-brand-100 text-sm">Call us today for a free site visit!</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-10">
            <h2 className="text-2xl font-serif font-bold text-slate-800 mb-6">Send us a Message</h2>
            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg flex flex-col items-center justify-center text-center h-full animate-fade-in-up">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p>Thank you for contacting Provision Land. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      minLength={2}
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      pattern="[0-9+\-\s]{10,}"
                      title="Please enter a valid phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                      placeholder="+254..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interest</label>
                  <select
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select a subject...</option>
                    <option value="Buying Land">Buying Land</option>
                    <option value="Buying House">Buying House</option>
                    <option value="Selling Property">Selling Property</option>
                    <option value="Site Visit">Schedule Site Visit</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    required
                    minLength={10}
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                    placeholder="I am interested in the plots at..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-slate-800 mb-3">Find Us on the Map</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Visit our office at Clairbourn Towers, Thika. We're conveniently located in the heart of town.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Map Container */}
            <div className="relative h-96 w-full">
              <iframe
                src={COMPANY_INFO.googleMapsEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Provision Land & Properties Ltd Location"
                className="absolute inset-0"
              ></iframe>
            </div>

            {/* Map Footer with CTA */}
            <div className="p-6 bg-gradient-to-r from-brand-50 to-accent-50 border-t border-brand-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-brand-600 p-3 rounded-full text-white">
                    <Navigation2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Provision Land & Properties Ltd</h3>
                    <p className="text-slate-600 text-sm">{COMPANY_INFO.address}</p>
                  </div>
                </div>
                <a
                  href={COMPANY_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <ExternalLink size={18} />
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-brand-100 text-brand-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <MapPin size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Our Office</h3>
              <p className="text-slate-600 text-sm">{COMPANY_INFO.address}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-accent-100 text-accent-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Phone size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Call Us</h3>
              <p className="text-slate-600 text-sm">{COMPANY_INFO.phone}</p>
              <p className="text-slate-500 text-xs mt-1">Sales: 0727 774 279</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Clock size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Working Hours</h3>
              <p className="text-slate-600 text-sm">Mon-Fri: 7 a.m. - 6 p.m.</p>
              <p className="text-slate-600 text-sm">Sat: 8 a.m. - 5 p.m.</p>
              <p className="text-slate-500 text-xs mt-1">Sun: On call</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};