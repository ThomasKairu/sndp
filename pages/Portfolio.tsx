import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Play } from 'lucide-react';

const PORTFOLIO_ITEMS = [
  {
    title: 'Baraka Phase 1 Matuu',
    image: '/phase 1.webp',
    families: 65,
    description: 'A pioneer project in Matuu that set the standard for affordable community living.'
  },
  {
    title: 'Baraka Phase 2 Matuu',
    image: '/phase 2.webp',
    families: 78,
    description: 'Expanding our footprint with premium amenities and ready-to-build plots.'
  },
  {
    title: 'Baraka Phase 3 Matuu',
    image: '/phase 3.webp',
    families: 92,
    description: 'Continuing the legacy of trust with rapid title deed processing.'
  },
  {
    title: 'Baraka Phase 4 Matuu',
    image: '/phase 4.webp',
    families: 110,
    description: 'Our most ambitious phase yet, featuring gated community concepts.'
  }
];

const VIDEOS = [
  { id: 'NlXH23l5Q-Y', title: 'Matuu Real Estate' },
  { id: 'o6385pc5CVk', title: 'Matuu: The Next Big Real Estate Opportunity' },
  { id: 'JRfu-7LNq_M', title: 'Matuu Is a Habitable Place' },
  { id: 'Taum6BcWna4', title: 'Lets Go To Matuu' },
  { id: 'NhyWxDtjWXI', title: 'Due Diligence In Land Ownership' },
  { id: 'lE9xopiCwE0', title: 'Investing In Matuu' },
  { id: 'Rb9WlwWJ4AM', title: 'Land Investment Interview' },
  { id: 'xDavVDSnYZo', title: 'PROVISION' },
  { id: 'vWEBTbQIKLU', title: 'Invest In Matuu Today' }
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

    <div className="container mx-auto px-4 py-16">

      {/* Success Stories Section */}
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-3">
        <span className="w-2 h-8 bg-brand-600 rounded-full"></span>
        Success Stories (Sold Out)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
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

      {/* Video Gallery Section */}
      <div className="border-t border-gray-200 pt-16">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4 flex items-center gap-3">
          <span className="w-2 h-8 bg-red-600 rounded-full"></span>
          Video Tours & Guidelines
        </h2>
        <p className="text-gray-600 mb-10 max-w-3xl">
          Watch our site visits, investment guides, and success stories directly from our YouTube channel.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {VIDEOS.map((video) => (
            <div key={video.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative pb-[56.25%] bg-black group cursor-pointer"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                  alt={video.title}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Play size={28} className="fill-white text-white ml-1" />
                  </div>
                </div>
              </a>
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                </div>
                <div className="mt-4 flex items-center text-sm text-red-600 font-medium group cursor-pointer">
                  <Play size={16} className="mr-2 fill-current" />
                  <span>Watch on YouTube</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://www.youtube.com/@ProvisionLandPropertiesLtd/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-red-500/30"
          >
            <Play size={20} className="fill-current" />
            View All Videos
          </a>
        </div>
      </div>

    </div>
  </div>
);