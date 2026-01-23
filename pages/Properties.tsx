import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PROPERTIES } from '../constants';
import { PropertyCard } from '../components/PropertyCard';
import { Filter, X, Search } from 'lucide-react';

export const PropertiesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [filterLocation, setFilterLocation] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);

  // Update searchQuery if URL changes (e.g. navigation from Home)
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const locations = ['All', ...Array.from(new Set(PROPERTIES.map(p => p.location.split(', ')[1] || p.location)))];
  const types = ['All', 'Land', 'Residential', 'Commercial'];

  const filteredProperties = useMemo(() => {
    return PROPERTIES.filter(p => {
      const matchLoc = filterLocation === 'All' || p.location.includes(filterLocation);
      const matchType = filterType === 'All' || p.type === filterType;

      // Keyword search logic
      const query = searchQuery.toLowerCase();
      const matchSearch = query === '' ||
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query) ||
        p.features.some(f => f.toLowerCase().includes(query)) ||
        p.size.toLowerCase().includes(query);

      return matchLoc && matchType && matchSearch;
    });
  }, [filterLocation, filterType, searchQuery]);

  const resetFilters = () => {
    setFilterLocation('All');
    setFilterType('All');
    setSearchQuery('');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Properties for Sale - Provision Land Limited | Thika, Murang'a, Machakos</title>
        <meta name="description" content="Browse our listing of prime plots for sale in Thika, Murang'a, Machakos, and more. Affordable prices and ready title deeds." />
        <link rel="canonical" href="https://provisionlands.co.ke/properties" />

        {/* Schema.org JSON-LD for Properties Listing */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CollectionPage",
                "@id": "https://provisionlands.co.ke/properties#webpage",
                "url": "https://provisionlands.co.ke/properties",
                "name": "Properties for Sale - Provision Land Limited",
                "description": "Browse our listing of prime plots for sale in Thika, Murang'a, Machakos. Affordable prices and ready title deeds.",
                "isPartOf": {"@id": "https://provisionlands.co.ke/#website"},
                "about": {"@id": "https://provisionlands.co.ke/#organization"}
              },
              {
                "@type": "ItemList",
                "name": "All Property Listings",
                "description": "Complete listing of land and properties for sale by Provision Land & Properties Ltd",
                "numberOfItems": 12,
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "item": {
                      "@type": "RealEstateListing",
                      "name": "Prime ½ Acre in Kiharu",
                      "description": "A prime and spacious parcel ideal for residential development, farming, or future investment. Located near the shopping center.",
                      "url": "https://provisionlands.co.ke/properties",
                      "image": "https://provisionlands.co.ke/Prime%20half%20Acre%20in%20Kiharu.webp",
                      "offers": {"@type": "Offer", "price": 1800000, "priceCurrency": "KES", "availability": "https://schema.org/InStock"},
                      "address": {"@type": "PostalAddress", "addressLocality": "Kigetuini Village, Murang'a", "addressCountry": "KE"}
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "item": {
                      "@type": "RealEstateListing",
                      "name": "1 Acre at Mang'u",
                      "description": "Ideal for building, farming, or residential development. Only 10 minutes drive from Thika town.",
                      "url": "https://provisionlands.co.ke/properties",
                      "image": "https://provisionlands.co.ke/1%20Acre%20at%20Mang'u.webp",
                      "offers": {"@type": "Offer", "price": 5000000, "priceCurrency": "KES", "availability": "https://schema.org/InStock"},
                      "address": {"@type": "PostalAddress", "addressLocality": "Mang'u, Thika", "addressCountry": "KE"}
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "item": {
                      "@type": "RealEstateListing",
                      "name": "Sagana Makutano Plots",
                      "description": "Genuine plots just 10 minutes from Makutano Junction. Near Kamweli Shopping Centre and schools.",
                      "url": "https://provisionlands.co.ke/properties",
                      "image": "https://provisionlands.co.ke/Sagana%20Makutano%20Plots.webp",
                      "offers": {"@type": "Offer", "price": 650000, "priceCurrency": "KES", "availability": "https://schema.org/InStock"},
                      "address": {"@type": "PostalAddress", "addressLocality": "Sagana Makutano", "addressCountry": "KE"}
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 4,
                    "item": {
                      "@type": "RealEstateListing",
                      "name": "Ithanga Murang'a Plots",
                      "description": "Affordable plots in Ithanga-Maragua, only 30 minutes from Thika. Ideal for home and farming.",
                      "url": "https://provisionlands.co.ke/properties",
                      "image": "https://provisionlands.co.ke/Ithanga%20Murang'a%20Plots.webp",
                      "offers": {"@type": "Offer", "price": 700000, "priceCurrency": "KES", "availability": "https://schema.org/InStock"},
                      "address": {"@type": "PostalAddress", "addressLocality": "Ithanga, Murang'a", "addressCountry": "KE"}
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 5,
                    "item": {
                      "@type": "RealEstateListing",
                      "name": "Kilimambogo / Oldonyo Sabuk",
                      "description": "Scenic plots near Oldonyo Sabuk national park area. Perfect for speculation or settlement.",
                      "url": "https://provisionlands.co.ke/properties",
                      "image": "https://provisionlands.co.ke/Kilimambogo%20Oldonyo%20Sabuk.webp",
                      "offers": {"@type": "Offer", "price": 600000, "priceCurrency": "KES", "availability": "https://schema.org/InStock"},
                      "address": {"@type": "PostalAddress", "addressLocality": "Kilimambogo", "addressCountry": "KE"}
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 6,
                    "item": {
                      "@type": "RealEstateListing",
                      "name": "Tola Ngoingwa",
                      "description": "Premium residential plots in Tola Ngoingwa estate. High-end neighborhood with security.",
                      "url": "https://provisionlands.co.ke/properties",
                      "image": "https://provisionlands.co.ke/Tola%20Ngoingwa.webp",
                      "offers": {"@type": "Offer", "price": 2300000, "priceCurrency": "KES", "availability": "https://schema.org/InStock"},
                      "address": {"@type": "PostalAddress", "addressLocality": "Tola, Thika", "addressCountry": "KE"}
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 7,
                    "item": {
                      "@type": "RealEstateListing",
                      "name": "Muguga / Gatuanyaga",
                      "description": "Strategic plots in Gatuanyaga area near Thika. High appreciation potential.",
                      "url": "https://provisionlands.co.ke/properties",
                      "image": "https://provisionlands.co.ke/Muguga%20Gatuanyaga.webp",
                      "offers": {"@type": "Offer", "price": 1800000, "priceCurrency": "KES", "availability": "https://schema.org/InStock"},
                      "address": {"@type": "PostalAddress", "addressLocality": "Gatuanyaga, Thika", "addressCountry": "KE"}
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 8,
                    "item": {
                      "@type": "RealEstateListing",
                      "name": "Makuyu Mananja Acre",
                      "description": "Large 1-acre block in Makuyu. Perfect for large scale farming or subdivision.",
                      "url": "https://provisionlands.co.ke/properties",
                      "image": "https://provisionlands.co.ke/Makuyu%20Mananja%20Acre.webp",
                      "offers": {"@type": "Offer", "price": 2500000, "priceCurrency": "KES", "availability": "https://schema.org/InStock"},
                      "address": {"@type": "PostalAddress", "addressLocality": "Makuyu Mananja", "addressCountry": "KE"}
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 9,
                    "item": {
                      "@type": "RealEstateListing",
                      "name": "Matuu Plots",
                      "description": "Very affordable investment plots in Matuu. Get started with land banking today.",
                      "url": "https://provisionlands.co.ke/properties",
                      "image": "https://provisionlands.co.ke/Matuu%20Plots.webp",
                      "offers": {"@type": "Offer", "price": 280000, "priceCurrency": "KES", "availability": "https://schema.org/InStock"},
                      "address": {"@type": "PostalAddress", "addressLocality": "Matuu", "addressCountry": "KE"}
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 10,
                    "item": {
                      "@type": "RealEstateListing",
                      "name": "Landless Thika",
                      "description": "Prime residential plot in Landless Thika. Larger size (85x100).",
                      "url": "https://provisionlands.co.ke/properties",
                      "image": "https://provisionlands.co.ke/Landless%20Thika.webp",
                      "offers": {"@type": "Offer", "price": 2500000, "priceCurrency": "KES", "availability": "https://schema.org/InStock"},
                      "address": {"@type": "PostalAddress", "addressLocality": "Landless, Thika", "addressCountry": "KE"}
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 11,
                    "item": {
                      "@type": "RealEstateListing",
                      "name": "Thika Town Commercial",
                      "description": "Prime commercial plot next to TIBS College. Ideal for hostels or commercial building.",
                      "url": "https://provisionlands.co.ke/properties",
                      "image": "https://provisionlands.co.ke/Thika%20Town%20Commercial.webp",
                      "offers": {"@type": "Offer", "price": 7500000, "priceCurrency": "KES", "availability": "https://schema.org/InStock"},
                      "address": {"@type": "PostalAddress", "addressLocality": "Thika Town", "addressCountry": "KE"}
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 12,
                    "item": {
                      "@type": "RealEstateListing",
                      "name": "Mwingi Acre",
                      "description": "Incredibly affordable 1 acre land in Mwingi. Best for long term banking.",
                      "url": "https://provisionlands.co.ke/properties",
                      "image": "https://provisionlands.co.ke/Mwingi%20Acre.webp",
                      "offers": {"@type": "Offer", "price": 200000, "priceCurrency": "KES", "availability": "https://schema.org/InStock"},
                      "address": {"@type": "PostalAddress", "addressLocality": "Mwingi", "addressCountry": "KE"}
                    }
                  }
                ]
              }
            ]
          }
        `}</script>
      </Helmet>
      {/* Header */}


      <div className="container mx-auto px-4">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden mb-6 flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded shadow-sm text-sm font-medium"
        >
          <Filter size={16} /> Filters
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`md:w-64 flex-shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Filter</h3>
                {showFilters && <button onClick={() => setShowFilters(false)}><X size={16} /></button>}
              </div>

              {/* Keywords Search Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Keywords</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Acre, Water, Highway"
                    className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <div className="space-y-2">
                  {types.map(type => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        className="text-brand-600 focus:ring-brand-500"
                        checked={filterType === type}
                        onChange={() => setFilterType(type)}
                      />
                      <span className="ml-2 text-sm text-gray-600">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="w-full text-sm text-brand-600 font-medium hover:text-brand-800"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map(p => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <p className="text-gray-500 text-lg">No properties match your criteria.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 text-brand-600 font-bold hover:underline"
                >
                  View All Listings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};