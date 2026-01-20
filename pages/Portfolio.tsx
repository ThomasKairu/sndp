import React from 'react';
import { Helmet } from 'react-helmet-async';

const PORTFOLIO_ITEMS = [
  {
    title: 'Baraka Phase 1 Matuu',
    image: '/phase 1.png',
    families: 65,
    description: 'A pioneer project in Matuu that set the standard for affordable community living.'
  },
  {
    title: 'Baraka Phase 2 Matuu',
    image: '/phase 2.jpg',
    families: 78,
    description: 'Expanding our footprint with premium amenities and ready-to-build plots.'
  },
  {
    title: 'Baraka Phase 3 Matuu',
    image: '/phase 3.jpg',
    families: 92,
    description: 'Continuing the legacy of trust with rapid title deed processing.'
  },
  {
    title: 'Baraka Phase 4 Matuu',
    image: '/phase 4.png',
    families: 110,
    description: 'Our most ambitious phase yet, featuring gated community concepts.'
  }
];

export const PortfolioPage: React.FC = () => (
  <div className="bg-gray-50 min-h-screen">
    <Helmet>
      <title>Our Portfolio - Provision Land Limited | Baraka Phases Matuu</title>
      <meta name="description" content="Explore our successful projects including the sold-out Baraka Phase 1-4 in Matuu. Trusted delivery of title deeds to hundreds of happy families." />
      <link rel="canonical" href="https://provisionlands.co.ke/portfolio" />
      <meta property="og:title" content="Our Portfolio - Provision Land Limited | Baraka Phases Matuu" />
      <meta property="og:description" content="See our track record of success with Baraka Phase 1-4 in Matuu. Hundreds of families settled." />
      <meta property="og:image" content="/phase 4.png" />
    </Helmet>
    <div className="relative bg-brand-900 text-white py-20 text-center">
        <div className="absolute inset-0">
          <img src="/our portfolio hero backround.jpg" className="w-full h-full object-cover opacity-20" alt="Background" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-transparent to-transparent"></div>
        </div>
        <h1 className="relative z-10 text-4xl font-serif font-bold mb-2">Our Portfolio</h1>
        <p className="relative z-10 text-brand-200">Delivering value across Kenya.</p>
    </div>
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PORTFOLIO_ITEMS.map((item, index) => (
          <div key={index} className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer h-[400px]">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover transition transform group-hover:scale-110 duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
              <div className="transform transition duration-300 translate-y-4 group-hover:translate-y-0">
                <h3 className="text-white text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-brand-300 font-semibold mb-2">Sold Out & Handed Over</p>
                <p className="text-gray-300 mb-4 opacity-0 group-hover:opacity-100 transition duration-300 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                   <span className="w-8 h-[1px] bg-accent-500"></span>
                   Successfully handed over to {item.families} happy families.
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);