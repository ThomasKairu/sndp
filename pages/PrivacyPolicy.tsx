import React from 'react';
import { Helmet } from 'react-helmet-async';
import { COMPANY_INFO } from '../constants';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <Helmet>
        <title>Privacy Policy - Provision Land & Properties Ltd</title>
        <meta name="description" content="Read our privacy policy to understand how Provision Land & Properties Ltd collects, uses, and protects your personal information." />
        <link rel="canonical" href="https://provisionlands.co.ke/privacy" />
      </Helmet>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-500 mb-8 text-sm">Last Updated: January 28, 2026</p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">1. Introduction</h2>
              <p>
                Welcome to {COMPANY_INFO.name}. We are committed to protecting your privacy and ensuring your personal information is handled in a safe and responsible manner. This policy outlines how we collect, use, and protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">2. Information We Collect</h2>
              <p>We may collect the following types of information:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Personal Identification Information (Name, email address, phone number, etc.) provided voluntarily via our contact forms.</li>
                <li>Property preferences and inquiry details.</li>
                <li>Usage Data (IP address, browser type) to improve website performance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">3. How We Use Your Data</h2>
              <p>We use your data to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Process your property inquiries and schedule site visits.</li>
                <li>Communicate with you regarding our services.</li>
                <li>Send promotional emails (only if you have opted in).</li>
                <li>Comply with legal obligations in Kenya.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">4. Data Protection</h2>
              <p>
                We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal data. We do not sell or trade your personal identifiable information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">5. Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal data held by us. If you wish to exercise these rights, please contact us at {COMPANY_INFO.email}.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:<br />
                <strong>Email:</strong> {COMPANY_INFO.email}<br />
                <strong>Phone:</strong> {COMPANY_INFO.phone}<br />
                <strong>Address:</strong> {COMPANY_INFO.address}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};