import React from 'react';
import { COMPANY_INFO } from '../constants';

export const TermsOfService: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">Terms of Service</h1>
          <p className="text-gray-500 mb-8 text-sm">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">1. Agreement to Terms</h2>
              <p>
                By accessing our website and using our services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">2. Property Information</h2>
              <p>
                While {COMPANY_INFO.name} strives to provide accurate and up-to-date information regarding property listings, prices, and availability, we do not guarantee the completeness or accuracy of such information. Property prices and availability are subject to change without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">3. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, images, and software, is the property of {COMPANY_INFO.name} and is protected by Kenyan and international copyright laws. Unauthorized use of this content is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">4. Limitation of Liability</h2>
              <p>
                {COMPANY_INFO.name} shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or for the cost of procurement of substitute services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">5. Site Visits and Transactions</h2>
              <p>
                Site visits are arranged at the discretion of the company. All land transactions are subject to the formal legal processes of land transfer in Kenya. We advise all clients to conduct due diligence.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">6. Governing Law</h2>
              <p>
                These terms shall be governed and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">7. Contact Information</h2>
              <p>
                Questions about the Terms of Service should be sent to us at {COMPANY_INFO.email}.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};