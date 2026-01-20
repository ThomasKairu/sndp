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
        <meta name="description" content="Browse our listing of prime plots for sale in Thika, Murang’a, Machakos, and more. Affordable prices and ready title deeds." />
        <link rel="canonical" href="https://provisionlands.co.ke/properties" />
      </Helmet>
      {/* Header */}
      <div className="relative bg-brand-900 text-white py-20 overflow-hidden mb-12">
        <div className="absolute inset-0">
          <img src="/our properties hero background.jpg" className="w-full h-full object-cover opacity-20" alt="Background" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-transparent to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl font-serif font-bold mb-2">Our Properties</h1>
          <p className="text-brand-200">Explore our diverse portfolio of prime real estate opportunities.</p>
        </div>
      </div>

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