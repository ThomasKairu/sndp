import React from 'react';
import { SERVICES } from '../constants';

export const ServicesPage: React.FC = () => (
    <div className="bg-gray-50 min-h-screen">
        <div className="relative bg-brand-900 text-white py-20 text-center">
             <div className="absolute inset-0">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover opacity-20" alt="Background" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent"></div>
            </div>
            <h1 className="relative z-10 text-4xl font-serif font-bold mb-2">Real Estate Solutions</h1>
            <p className="relative z-10 text-brand-200">Comprehensive services designed to maximize value.</p>
        </div>
        <div className="container mx-auto px-4 py-16">
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">We leverage our deep market knowledge and extensive network to deliver results that exceed expectations for land owners and home buyers.</p>
            
            <div className="grid grid-cols-1 gap-12 max-w-5xl mx-auto">
                {SERVICES.map((service, idx) => (
                    <div key={service.id} className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                        <div className="flex-1">
                            <img src={`https://images.unsplash.com/photo-${idx === 0 ? '1629016943332-8bd56635e076' : idx === 1 ? '1554224155-8d04cb21cd6c' : idx === 2 ? '1564013799919-ab600027ffc6' : '1542744173-8e7e53415bb0'}?auto=format&fit=crop&w=800&q=80`} alt={service.title} className="rounded-2xl shadow-xl w-full" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-xl">
                                {idx + 1}
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900">{service.title}</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">{service.description} We leverage our deep market knowledge and extensive network to deliver results that exceed expectations.</p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-gray-700"><div className="w-2 h-2 bg-accent-500 rounded-full"></div> Professional Consultation</li>
                                <li className="flex items-center gap-2 text-gray-700"><div className="w-2 h-2 bg-accent-500 rounded-full"></div> Market Analysis</li>
                                <li className="flex items-center gap-2 text-gray-700"><div className="w-2 h-2 bg-accent-500 rounded-full"></div> End-to-end Support</li>
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);