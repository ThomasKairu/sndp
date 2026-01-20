import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BLOG_POSTS } from '../constants';
import { Calendar, ArrowRight, ArrowLeft, Clock, Tag } from 'lucide-react';
import { BlogPost } from '../types';

export const NewsPage: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Detail View
  if (selectedPost) {
    return (
      <div className="bg-white min-h-screen animate-fade-in-up">
        <Helmet>
          <title>{selectedPost.title} - Provision Land News</title>
          <meta name="description" content={selectedPost.excerpt} />
          <meta property="og:title" content={selectedPost.title} />
          <meta property="og:description" content={selectedPost.excerpt} />
          <meta property="og:image" content={selectedPost.image} />
        </Helmet>
        {/* Article Header Image */}
        <div className="relative h-[400px] w-full">
          <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white container mx-auto">
            <button 
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-2 text-sm font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-full hover:bg-white/30 transition mb-6 w-fit"
            >
              <ArrowLeft size={16} /> Back to News
            </button>
            <div className="flex items-center gap-4 text-sm mb-4 text-brand-100">
               <span className="flex items-center gap-1"><Calendar size={14} /> {selectedPost.date}</span>
               <span className="flex items-center gap-1"><Tag size={14} /> {selectedPost.category}</span>
               <span className="flex items-center gap-1"><Clock size={14} /> 5 min read</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight max-w-4xl">{selectedPost.title}</h1>
          </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-4 py-16 max-w-4xl">
           <div className="prose prose-lg prose-slate max-w-none">
             {/* Render content preserving newlines for paragraphs */}
             {selectedPost.content.split('\n\n').map((paragraph, idx) => {
               // Simple markdown-like parser for bold text (**text**)
               const parts = paragraph.split(/(\*\*.*?\*\*)/g);
               return (
                 <p key={idx} className="mb-6 text-gray-700 leading-relaxed text-lg">
                   {parts.map((part, i) => {
                     if (part.startsWith('**') && part.endsWith('**')) {
                       return <strong key={i} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>;
                     }
                     return part;
                   })}
                 </p>
               );
             })}
           </div>

           <div className="mt-12 pt-12 border-t border-gray-100">
             <h3 className="text-2xl font-bold text-slate-900 mb-6">Interested in this opportunity?</h3>
             <div className="bg-brand-50 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
               <div>
                 <p className="font-bold text-brand-900 text-lg">Talk to an expert today.</p>
                 <p className="text-gray-600">Our team can guide you through the investment process in {selectedPost.category} areas.</p>
               </div>
               <a href="/contact" className="bg-brand-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-700 transition whitespace-nowrap">
                 Contact Us
               </a>
             </div>
           </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>News & Market Insights - Provision Land Limited</title>
        <meta name="description" content="Stay updated with the latest real estate trends, market analysis, and land investment opportunities in Kenya." />
        <link rel="canonical" href="https://provisionlands.co.ke/news" />
      </Helmet>
      <div className="relative bg-brand-900 text-white py-20 text-center">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover opacity-20" alt="Background" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10 container mx-auto px-4">
            <h1 className="text-4xl font-serif font-bold mb-2">News & Market Insights</h1>
            <p className="text-brand-200 text-lg">Trusted analysis on the Kenyan Real Estate Market.</p>
          </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition group flex flex-col h-full">
              <div className="h-48 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-xs text-gray-500 mb-3 gap-4">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                  <span className="flex items-center gap-1 text-brand-600 font-bold uppercase tracking-wider text-[10px]">{post.category}</span>
                </div>
                <h3 
                  onClick={() => setSelectedPost(post)}
                  className="text-xl font-bold mb-3 hover:text-brand-600 cursor-pointer text-slate-900 leading-snug"
                >
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3">{post.excerpt}</p>
                <div className="mt-auto">
                  <button 
                    onClick={() => setSelectedPost(post)}
                    className="text-brand-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Read Full Article <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};