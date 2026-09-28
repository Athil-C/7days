import React, { useState } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { 
  SHOP_FULL_NAME, 
  createWhatsAppUrl 
} from '../data/config';
import LocationSection from '../components/LocationSection';
import { usePageSEO } from '../hooks/usePageSEO';

export default function ContactPage() {
  usePageSEO({
    title: 'Contact 7Days Toys & Babyshop | Mananthavady',
    description: "Contact 7Days Toys & Babyshop in Payod, Mananthavady, Wayanad. Store address, phone numbers, map directions, and WhatsApp inquiry.",
    canonicalPath: '/contact'
  });

  const [customTopic, setCustomTopic] = useState('');
  const [customChildAge, setCustomChildAge] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const generateCustomWhatsAppUrl = (e) => {
    e.preventDefault();
    let text = `Hi ${SHOP_FULL_NAME}, I'm reaching out from your website!`;
    if (customTopic) {
      text += `\n- Interested in: ${customTopic}`;
    }
    if (customChildAge) {
      text += `\n- Age of child: ${customChildAge}`;
    }
    if (customNotes) {
      text += `\n- Message: ${customNotes}`;
    }
    window.open(createWhatsAppUrl(text), '_blank');
  };

  return (
    <main className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6A994E]/15 text-[#6A994E] text-xs font-bold uppercase tracking-wider mb-2.5">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Contact &amp; Visit</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#263238] font-heading tracking-tight mb-2">
            Contact {SHOP_FULL_NAME}
          </h1>
          <p className="text-base sm:text-lg font-bold text-[#FB8500] mb-3">
            We'd Love to Hear from You
          </p>
          <p className="text-[#546E7A] text-sm sm:text-base leading-relaxed">
            Have questions about a toy, baby essential, or gift availability? Get in touch with our team or visit our store in Payod, Mananthavady.
          </p>
        </div>

        {/* Location Section */}
        <div className="mb-14">
          <LocationSection />
        </div>

        {/* Quick WhatsApp Inquiry Form Section */}
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl card-shadow border border-black/5">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#FB8500] bg-[#FB8500]/10 px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fast WhatsApp Assistant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#263238] font-heading">
              Looking for Product Recommendations?
            </h2>
            <p className="text-xs sm:text-sm text-[#546E7A] mt-1">
              Fill in a few details and click to open a pre-filled WhatsApp message directly with us!
            </p>
          </div>

          <form onSubmit={generateCustomWhatsAppUrl} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#263238] uppercase tracking-wider mb-1.5">
                  What are you looking for?
                </label>
                <select
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFF9F0] border border-black/10 text-sm focus:border-[#FB8500] focus:ring-2 focus:ring-[#FB8500]/20 focus:outline-none"
                >
                  <option value="">Select an option</option>
                  <option value="Birthday Gift for Kid">Birthday Gift</option>
                  <option value="Baby Essentials / Stroller / Walker">Baby Essentials / Walker</option>
                  <option value="Remote Control Toy / Vehicle">RC Toy / Car</option>
                  <option value="Educational & Learning Toys">Educational / Puzzle Toys</option>
                  <option value="Plush / Soft Toys">Plush & Soft Toys</option>
                  <option value="School Accessories / Water Bottle">School Accessories</option>
                  <option value="General Store Inquiry">General Store Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263238] uppercase tracking-wider mb-1.5">
                  Age of the Child (Optional)
                </label>
                <input
                  type="text"
                  value={customChildAge}
                  onChange={(e) => setCustomChildAge(e.target.value)}
                  placeholder="e.g., Newborn, 2 years, 6 years..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFF9F0] border border-black/10 text-sm focus:border-[#FB8500] focus:ring-2 focus:ring-[#FB8500]/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263238] uppercase tracking-wider mb-1.5">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Mention any specific character, budget range, or brand you like..."
                className="w-full px-4 py-3 rounded-2xl bg-[#FFF9F0] border border-black/10 text-sm focus:border-[#FB8500] focus:ring-2 focus:ring-[#FB8500]/20 focus:outline-none resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-6 rounded-full font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Send Inquiry on WhatsApp</span>
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
