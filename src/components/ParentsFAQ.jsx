import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Sparkles } from 'lucide-react';
import { createWhatsAppUrl, SHOP_FULL_NAME, SHOP_ADDRESS } from '../data/config';

export default function ParentsFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'Where is 7Days Toys & Babyshop located?',
      a: `Our physical showroom is conveniently located in ${SHOP_ADDRESS.line1}, ${SHOP_ADDRESS.town}, ${SHOP_ADDRESS.district}, ${SHOP_ADDRESS.state}. You can visit us in person or get one-tap directions via Google Maps.`
    },
    {
      q: 'Can I ask about product availability before visiting?',
      a: 'Yes, absolutely! Tap "Ask on WhatsApp" on any product card or send us a message, and our showroom team will promptly check in-store availability for you.'
    },
    {
      q: 'Can I request a short video of a product in action?',
      a: 'Yes. For products like RC cars, drones, bicycles, kick scooters, and battery ride-ons, click "Ask for Video" to request a quick clip via WhatsApp before visiting.'
    },
    {
      q: 'Do you have bicycles, tricycles, and sports items?',
      a: 'Yes, we carry kids sports bicycles, canopy tricycles, swing twist cars, kick scooters, footballs, cricket sets, and badminton kits in our Payod store.'
    },
    {
      q: 'Do you provide cycle repairs, ride-on service, or spare parts?',
      a: 'Yes. We offer service, battery replacements, and spare parts for kids electric cars/bikes as well as multi-speed and kids bicycles at our Payod showroom.'
    },
    {
      q: 'What should I buy for a birthday gift?',
      a: 'Use our 4-step "Birthday & Gift Finder" right above, or message us on WhatsApp with the child\'s age and your budget, and our team will recommend great in-store options.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(prev => (prev === index ? -1 : index));
  };

  return (
    <section id="parents-faq" className="py-14 sm:py-20 bg-white/50 border-t border-black/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB703]/20 text-[#263238] text-xs font-bold uppercase tracking-wider mb-2.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#FB8500]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
            Parents Ask Us
          </h2>
          <p className="text-[#546E7A] text-sm sm:text-base mt-2">
            Quick, honest answers to help make your showroom visit or inquiry effortless.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 mb-10">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-black/5 card-shadow overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  type="button"
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-[#263238] font-heading">
                    {faq.q}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FFF9F0] flex items-center justify-center text-[#FB8500] shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#546E7A] leading-relaxed border-t border-black/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick WhatsApp Help Callout */}
        <div className="text-center p-6 rounded-3xl bg-[#FFF9F0] border border-[#FFB703]/30 card-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-sm font-bold text-[#263238] font-heading flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FB8500]" />
              Still have a question?
            </p>
            <p className="text-xs text-[#546E7A] mt-0.5">
              Our store staff is just one message away on WhatsApp.
            </p>
          </div>

          <a
            href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I have a question about products and services at your Payod store.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Ask us on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
}
