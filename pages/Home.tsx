import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { PROPERTIES, SERVICES } from '../constants';
import { FeaturedPropertyCard } from '../components/PropertyCard';

const HERO_SLIDES = [
  {
    image: '/carousel1.webp',
    title: 'Choose the Best',
    subtitle: 'We Promise and Deliver Genuinely',
    align: 'left'
  },
  {
    image: '/carousel2.webp',
    title: 'Trusted by Thousands',
    subtitle: 'Your Title Deed is Ready',
    align: 'center'
  },
  {
    image: '/carousel3.webp',
    title: 'Genuine Documentation',
    subtitle: 'Hassle-free Transfer Process',
    align: 'center'
  },
  {
    image: '/carousel4.webp',
    title: 'Free Site Visits',
    subtitle: 'Every Saturday - Join Us!',
    align: 'right'
  },
  {
    image: '/carousel5.webp',
    title: 'Prime Locations',
    subtitle: 'Makutano, Ithanga, Thika',
    align: 'center'
  },
  {
    image: '/carousel6.webp',
    title: 'Tola Estate Ngoingwa',
    subtitle: 'Premium Residential Plots',
    align: 'left'
  },
  {
    image: '/carousel7.webp',
    title: 'Invest Today',
    subtitle: 'Secure Your Future',
    align: 'right'
  }
];

const featuredProperties = PROPERTIES.slice(0, 8);

export const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000); // Change slide every 4 seconds
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  // Dynamic Schema Generation
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://provisionlands.co.ke/#organization",
        "name": "Provision Land & Properties Ltd",
        "alternateName": "Provision Lands",
        "url": "https://provisionlands.co.ke",
        "logo": {
          "@type": "ImageObject",
          "url": "https://provisionlands.co.ke/web-app-manifest-512x512.png",
          "width": 512,
          "height": 512
        },
        "description": "Genuine land for sale in Kenya with ready title deeds. Affordable plots in Thika, Murang'a, Sagana, and Machakos.",
        "telephone": "+254797331355",
        "email": "info@provisionlands.co.ke",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Clairbourn Towers, 5th Floor",
          "addressLocality": "Thika",
          "addressRegion": "Kiambu County",
          "addressCountry": "KE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -1.035323,
          "longitude": 37.074561
        },
        "sameAs": [
          "https://web.facebook.com/p/Provision-Land-Properties-Ltd-61551485047029/",
          "https://www.instagram.com/provision_land_properties_ltd/"
        ]
      },
      {
        "@type": "RealEstateAgent",
        "@id": "https://provisionlands.co.ke/#business",
        "name": "Provision Land & Properties Ltd",
        "url": "https://provisionlands.co.ke",
        "telephone": "+254797331355",
        "email": "info@provisionlands.co.ke",
        "slogan": "We Promise and Deliver Genuinely",
        "priceRange": "KES 200,000 - KES 7,500,000",
        "paymentAccepted": "Cash, Bank Transfer, Mpesa",
        "currenciesAccepted": "KES",
        "areaServed": [
          { "@type": "City", "name": "Thika" },
          { "@type": "City", "name": "Murang'a" },
          { "@type": "City", "name": "Machakos" },
          { "@type": "AdministrativeArea", "name": "Kiambu County" },
          { "@type": "AdministrativeArea", "name": "Murang'a County" },
          { "@type": "AdministrativeArea", "name": "Machakos County" }
        ],
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
            "opens": "08:00",
            "closes": "17:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "09:00",
            "closes": "14:00"
          }
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Land & Property Listings",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Land Sales" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Property Valuation" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Real Estate Management" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Consultancy" } }
          ]
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://provisionlands.co.ke/#website",
        "url": "https://provisionlands.co.ke",
        "name": "Provision Land & Properties Ltd",
        "description": "Find genuine land for sale in Kenya with ready title deeds",
        "publisher": { "@id": "https://provisionlands.co.ke/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://provisionlands.co.ke/properties?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "WebPage",
        "@id": "https://provisionlands.co.ke/#webpage",
        "url": "https://provisionlands.co.ke/",
        "name": "Home - Provision Land Limited | Land for Sale in Kenya",
        "description": "Find your dream plot with Provision Land Limited. Genuine, affordable land in Thika, Makutano, Sagana, and Machakos with ready title deeds.",
        "isPartOf": { "@id": "https://provisionlands.co.ke/#website" },
        "about": { "@id": "https://provisionlands.co.ke/#organization" },
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": "https://provisionlands.co.ke/carousel1.webp"
        }
      },
      {
        "@type": "ItemList",
        "name": "Featured Properties",
        "description": "Handpicked prime plots from Thika, Murang'a, and Machakos",
        "numberOfItems": featuredProperties.length,
        "itemListElement": featuredProperties.map((prop, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "RealEstateListing",
            "name": prop.title,
            "url": "https://provisionlands.co.ke/properties",
            "description": prop.description,
            "image": `https://provisionlands.co.ke${prop.image}`,
            "offers": {
              "@type": "Offer",
              "price": prop.price,
              "priceCurrency": "KES",
              "availability": "https://schema.org/InStock"
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": prop.location,
              "addressCountry": "KE"
            }
          }
        }))
      }
    ]
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Home - Provision Land Limited | Land for Sale in Kenya</title>
        <meta name="description" content="Find your dream plot with Provision Land Limited. We offer genuine, affordable land in Thika, Makutano, Sagana, and Machakos with ready title deeds." />
        <link rel="canonical" href="https://provisionlands.co.ke/" />
        <link rel="preload" as="image" href="/carousel1.webp" fetchpriority="high" />

        {/* Schema.org JSON-LD for AI and Search Engines */}
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>

      {/* Infinite Carousel Hero Section */}
      <section className="relative h-[300px] flex items-center overflow-hidden bg-brand-900 group">

        {/* Slides */}
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={slide.image}
                alt={slide.title}
                width="1920"
                height="500"
                fetchPriority={index === 0 ? 'high' : 'low'}
                loading={index === 0 ? 'eager' : 'lazy'}
                className={`w-full h-full object-fill object-center transform transition-transform duration-[8000ms] ease-linear ${index === currentSlide ? 'scale-105' : 'scale-100'
                  }`}
              />

            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-4 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition opacity-0 group-hover:opacity-100 hidden md:block min-w-[48px] min-h-[48px]"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-4 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition opacity-0 group-hover:opacity-100 hidden md:block min-w-[48px] min-h-[48px]"
        >
          <ChevronRight size={32} />
        </button>


      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Featured Properties</h2>
              <p className="text-gray-600">Handpicked prime plots from Thika, Murang'a, and Machakos.</p>
            </div>
            <Link to="/properties" className="hidden md:flex items-center gap-2 text-brand-600 font-bold hover:text-accent-600 transition">
              View All Properties <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProperties.map((prop) => (
              <FeaturedPropertyCard key={prop.id} property={prop} />
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link to="/properties" className="inline-block bg-white border border-gray-300 text-slate-700 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-brand-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-800 skew-x-12 transform translate-x-20 opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <img src="/our core value.webp" alt="Why Choose Us - Core Values" width="800" height="600" className="rounded-2xl shadow-2xl border-4 border-brand-700" loading="lazy" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Our Core Values</h2>
            <p className="text-brand-100 mb-8 leading-relaxed">
              At Provision Land & Properties Ltd, we are driven by:
            </p>
            <ul className="space-y-4">
              {[
                'Integrity - We are honest in all dealings',
                'Efficiency - We value your time',
                'Quality Service - Professionalism at its peak',
                'Transparency - No hidden costs or issues',
                'Trust - Your partner in growth'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="text-accent-500 shrink-0" />
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link to="/contact" className="bg-accent-600 hover:bg-accent-700 text-white px-8 py-3 rounded-full font-bold transition shadow-lg shadow-accent-600/20 inline-block">
                Contact Us Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-brand-600 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/our properties hero background.webp')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-serif font-bold mb-4">Site Visits Available Daily!</h2>
          <p className="text-brand-100 mb-8 max-w-2xl mx-auto">Call 0797 331 355 or 0727 774 279 to book your site visit to Matuu, Thika, or Ithanga.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/contact" className="bg-white text-brand-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg border border-brand-200">
              Book Site Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};