import React, { useState, useRef, useEffect } from 'react';
import { Property } from '../types';
import { MapPin, Maximize2, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeaturedPropertyCardProps {
  property: Property;
}

export const FeaturedPropertyCard: React.FC<FeaturedPropertyCardProps> = ({ property }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsImageLoaded(true);
    }
  }, []);

  // Format price for display (e.g., 450000 -> "450K")
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${Math.round(price / 1000)}K`;
    }
    return price.toString();
  };



  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Container with Overlays */}
      <div className="relative overflow-hidden h-64 bg-gray-100">
        {/* Loading Skeleton */}
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center transition-opacity duration-500 ${isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
        >
          <Loader className="w-6 h-6 text-gray-400 animate-spin" />
        </div>


        {/* Actual Image */}
        <img
          ref={imgRef}
          src={property.image}
          alt={property.title}
          width="400"
          height="256"
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Featured Badge - Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-brand-500 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide shadow-md">
            Featured
          </span>
        </div>


      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Price Range */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-brand-600 font-bold text-sm">
            Ksh {property.price.toLocaleString()}
          </span>
          <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
            {property.status}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-brand-600 transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin size={14} className="mr-1 text-brand-500 shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Details */}
        <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Maximize2 size={14} className="text-brand-500" />
            <span>{property.size}</span>
          </div>
          {property.type && (
            <div className="flex items-center">
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded">
                {property.type}
              </span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Link
          to="/properties"
          className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-md transition-all shadow-sm hover:shadow-md"
        >
          BUY NOW
        </Link>
      </div>
    </div>
  );
};

// Keep the original PropertyCard for other pages
export const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsImageLoaded(true);
    }
  }, []);

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
          ref={imgRef}
          src={property.image}
          alt={property.title}
          width="400"
          height="256"
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>

        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide shadow-md ${property.status === 'For Sale' ? 'bg-brand-600' : 'bg-red-500'
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
            <Maximize2 size={16} className="text-brand-500 mb-1" />
            <span className="text-xs text-gray-600 font-medium">{property.size}</span>
          </div>
          {!property.bedrooms && !property.bathrooms && (
            <div className="col-span-2 flex items-center justify-center text-center border-l border-gray-100 text-xs text-gray-400 italic">
              Land Only
            </div>
          )}
        </div>

        <div>
          <Link to="/properties" className="w-full inline-flex justify-center items-center py-2.5 rounded-lg border border-brand-100 text-brand-700 font-bold hover:bg-brand-50 hover:border-brand-300 transition-all text-sm group-hover:bg-brand-600 group-hover:text-white group-hover:border-transparent shadow-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};