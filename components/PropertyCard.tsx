import React, { useState } from 'react';
import { Property } from '../types';
import { MapPin, Bed, Bath, Move, ArrowRight, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-brand-200 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative overflow-hidden h-64 bg-gray-100">
        {/* Loading Skeleton */}
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center transition-opacity duration-500 ${isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
        >
          <Loader className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
        
        {/* Actual Image */}
        <img 
          src={property.image} 
          alt={property.title} 
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>

        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide shadow-md ${
            property.status === 'For Sale' ? 'bg-brand-600' : 'bg-red-500'
          }`}>
            {property.status}
          </span>
        </div>
        
        <div className="absolute top-4 right-4 z-10">
           <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-900 shadow-lg border border-white/50">
            {property.type}
          </span>
        </div>
        
        {/* Price on Image for impact */}
        <div className="absolute bottom-4 left-4 z-10">
           <p className="text-white font-bold text-xl drop-shadow-md">KES {property.price.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow relative">
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-1">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin size={16} className="mr-1 text-accent-500 shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {property.description}
        </p>
        
        <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-100 py-4 mb-4 mt-auto">
           <div className="flex flex-col items-center justify-center text-center">
             <Move size={16} className="text-brand-500 mb-1" />
             <span className="text-xs text-gray-600 font-medium">{property.size}</span>
           </div>
           {property.bedrooms && (
             <div className="flex flex-col items-center justify-center text-center border-l border-gray-100">
               <Bed size={16} className="text-brand-500 mb-1" />
               <span className="text-xs text-gray-600 font-medium">{property.bedrooms} Bed</span>
             </div>
           )}
           {property.bathrooms && (
             <div className="flex flex-col items-center justify-center text-center border-l border-gray-100">
               <Bath size={16} className="text-brand-500 mb-1" />
               <span className="text-xs text-gray-600 font-medium">{property.bathrooms} Bath</span>
             </div>
           )}
           {!property.bedrooms && !property.bathrooms && (
             <div className="col-span-2 flex items-center justify-center text-center border-l border-gray-100 text-xs text-gray-400 italic">
               Land Only
             </div>
           )}
        </div>

        <div>
          <Link to="/properties" className="w-full inline-flex justify-center items-center py-2.5 rounded-lg border border-brand-100 text-brand-700 font-bold hover:bg-brand-50 hover:border-brand-300 transition-all text-sm group-hover:bg-brand-600 group-hover:text-white group-hover:border-transparent shadow-sm">
            View Details <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};