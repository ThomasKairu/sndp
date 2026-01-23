import React from 'react';
import { Helmet } from 'react-helmet-async';
import { TEAM, TESTIMONIALS } from '../constants';
import { Target, Eye, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div>
      <Helmet>
        <title>About Us - Provision Land Limited | Trusted Real Estate Partner</title>
        <meta name="description" content="Learn about Provision Land Limited, our mission, vision, and the team committed to delivering genuine land and real estate solutions in Kenya." />
        <link rel="canonical" href="https://provisionlands.co.ke/about" />

        {/* Schema.org JSON-LD for About Page */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "AboutPage",
                "@id": "https://provisionlands.co.ke/about#webpage",
                "url": "https://provisionlands.co.ke/about",
                "name": "About Us - Provision Land Limited",
                "description": "Learn about Provision Land Limited, our mission, vision, and the team committed to delivering genuine land and real estate solutions in Kenya.",
                "isPartOf": {"@id": "https://provisionlands.co.ke/#website"},
                "about": {"@id": "https://provisionlands.co.ke/#organization"}
              },
              {
                "@type": "Organization",
                "@id": "https://provisionlands.co.ke/#organization-extended",
                "name": "Provision Land & Properties Ltd",
                "url": "https://provisionlands.co.ke",
                "foundingDate": "2015",
                "slogan": "We Promise and Deliver Genuinely",
                "knowsAbout": [
                  "Real Estate Sales",
                  "Land Banking",
                  "Property Valuation",
                  "Title Deed Processing",
                  "Ardhisasa Compliant Transactions"
                ],
                "member": [
                  {
                    "@type": "Person",
                    "name": "Stephen Ndung'u",
                    "jobTitle": "CEO & Founder",
                    "description": "Leading Provision Land & Properties Ltd with a promise to deliver genuinely.",
                    "image": "https://provisionlands.co.ke/Stephen%20Ndung'u.webp",
                    "worksFor": {"@id": "https://provisionlands.co.ke/#organization"}
                  },
                  {
                    "@type": "Person",
                    "name": "Sales Team",
                    "jobTitle": "Customer Relations",
                    "description": "Our dedicated team is ready to take you for site visits daily.",
                    "image": "https://provisionlands.co.ke/Sales%20Team.webp",
                    "worksFor": {"@id": "https://provisionlands.co.ke/#organization"}
                  }
                ],
                "review": [
                  {
                    "@type": "Review",
                    "author": {"@type": "Person", "name": "James Mwangi"},
                    "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5},
                    "reviewBody": "I bought my plot in Ithanga for 700k. The title deed was ready as promised. Genuine people."
                  },
                  {
                    "@type": "Review",
                    "author": {"@type": "Person", "name": "Sarah Njoroge"},
                    "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5},
                    "reviewBody": "The 1 acre in Mang'u is a gem. 10 mins from town and very affordable compared to others."
                  },
                  {
                    "@type": "Review",
                    "author": {"@type": "Person", "name": "David Otieno"},
                    "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5},
                    "reviewBody": "5-star service! They took me for a site visit and the process was seamless."
                  }
                ]
              }
            ]
          }
        `}</script>
      </Helmet>


      {/* Mission/Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition">
              <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-brand-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Our Mission</h3>
              <p className="text-gray-600">To provide affordable, genuine, and value-added real estate solutions that empower our clients to achieve financial freedom.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition">
              <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="text-brand-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Our Vision</h3>
              <p className="text-gray-600">To be the preferred real estate partner in East Africa, known for integrity, innovation, and customer excellence.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition">
              <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="text-brand-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Core Values</h3>
              <p className="text-gray-600">Integrity, Transparency, Customer Focus, and Professionalism drive every decision we make.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-slate-900">Meet the Team</h2>
            <div className="h-1 w-16 bg-accent-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM.map(member => (
              <div key={member.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group">
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-brand-600 font-medium text-sm mb-3 uppercase tracking-wide">{member.role}</p>
                  <p className="text-gray-500 text-sm italic">"{member.bio}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center text-slate-900 mb-12">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(t => (
              <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                <div className="absolute -top-4 left-6">
                  <div className="text-6xl text-brand-100 font-serif leading-none">"</div>
                </div>
                <p className="text-gray-600 italic mb-6 relative z-10 pt-4">{t.content}</p>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-sm text-slate-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};