import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { BLOG_POSTS } from '../constants';
import { Calendar, ArrowRight, ArrowLeft, Clock, Tag } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find the post based on the URL parameter
  const selectedPost = id ? BLOG_POSTS.find(post => post.id === id) : null;

  // Scroll to top when opening a post
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Helper function to parse inline bold and links
  const parseInline = (text: string) => {
    // First split by bold
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>;
      }

      // Check for links [text](url) inside non-bold parts
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const linkParts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(part)) !== null) {
        // Push text before link
        if (match.index > lastIndex) {
          linkParts.push(part.slice(lastIndex, match.index));
        }
        // Push link
        linkParts.push(
          <a key={`${i}-${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 underline font-medium">
            {match[1]}
          </a>
        );
        lastIndex = linkRegex.lastIndex;
      }
      // Push remaining text
      if (lastIndex < part.length) {
        linkParts.push(part.slice(lastIndex));
      }

      return linkParts.length > 0 ? <span key={i}>{linkParts}</span> : part;
    });
  };

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
          <link rel="canonical" href={`https://provisionlands.co.ke/news/${selectedPost.id}`} />
          {/* Article Schema */}
          <script type="application/ld+json">{`
            {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": "${selectedPost.title}",
              "image": "https://provisionlands.co.ke${selectedPost.image}",
              "datePublished": "${new Date(selectedPost.date).toISOString().split('T')[0]}",
              "author": {
                "@type": "Organization",
                "name": "Provision Land & Properties Ltd"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Provision Land & Properties Ltd",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://provisionlands.co.ke/logo.png"
                }
              },
              "description": "${selectedPost.excerpt}"
            }
          `}</script>
        </Helmet>

        {/* Article Header Image */}
        <div className="relative h-[400px] w-full">
          <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white container mx-auto">
            <button
              onClick={() => navigate('/news')}
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
            {/* Render content with custom markdown parser */}
            {selectedPost.content.split('\n').reduce((acc: any[], line, idx) => {
              // Handle Headers
              if (line.startsWith('### ')) {
                acc.push(<h3 key={idx} className="text-2xl font-bold text-slate-900 mt-8 mb-4">{line.replace('### ', '')}</h3>);
                return acc;
              }
              if (line.startsWith('## ')) {
                acc.push(<h2 key={idx} className="text-3xl font-bold text-slate-900 mt-10 mb-6">{line.replace('## ', '')}</h2>);
                return acc;
              }

              // Handle Lists
              if (line.trim().startsWith('* ')) {
                const content = line.trim().replace('* ', '');
                acc.push(
                  <div key={idx} className="flex items-start gap-2 mb-2 ml-4">
                    <span className="text-brand-500 mt-1.5">•</span>
                    <span className="text-gray-700 text-lg">{parseInline(content)}</span>
                  </div>
                );
                return acc;
              }

              // Handle Empty lines
              if (line.trim() === '') {
                return acc;
              }

              // Handle Paragraphs
              acc.push(
                <p key={idx} className="mb-4 text-gray-700 leading-relaxed text-lg">
                  {parseInline(line)}
                </p>
              );
              return acc;
            }, [])}
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

        {/* Schema.org JSON-LD for News/Blog Page */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": "https://provisionlands.co.ke/news#blog",
            "url": "https://provisionlands.co.ke/news",
            "name": "Provision Land News & Market Insights",
            "description": "Stay updated with the latest real estate trends, market analysis, and land investment opportunities in Kenya.",
            "publisher": {"@id": "https://provisionlands.co.ke/#organization"},
            "blogPost": [
              ${BLOG_POSTS.map(post => `{
                "@type": "BlogPosting",
                "headline": "${post.title}",
                "description": "${post.excerpt}",
                "image": "https://provisionlands.co.ke${post.image}",
                "datePublished": "${new Date(post.date).toISOString().split('T')[0]}",
                "author": {"@id": "https://provisionlands.co.ke/#organization"},
                "url": "https://provisionlands.co.ke/news/${post.id}"
              }`).join(',')}
            ]
          }
        `}</script>
      </Helmet>

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
                  onClick={() => navigate(`/news/${post.id}`)}
                  className="text-xl font-bold mb-3 hover:text-brand-600 cursor-pointer text-slate-900 leading-snug"
                >
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3">{post.excerpt}</p>
                <div className="mt-auto">
                  <button
                    onClick={() => navigate(`/news/${post.id}`)}
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