import React from 'react';
import { Wrench, BatteryCharging, Bike, Cpu, MessageCircle, Phone, Sparkles } from 'lucide-react';
import { createWhatsAppUrl, SHOP_PHONE_CALL, SHOP_PHONE_DISPLAY, SHOP_FULL_NAME } from '../data/config';

export default function CareServices() {
  const verifiedServices = [
    {
      icon: Cpu,
      title: 'Kids EV & Ride-on Servicing',
      description: 'Complete maintenance, diagnostics, and repairs for children\'s electric cars and rechargeable bikes.',
      tag: 'Electric Vehicles',
      accent: 'text-[#FB8500]',
      bg: 'bg-[#FB8500]/15'
    },
    {
      icon: Bike,
      title: 'Gear Cycle Service & Tuning',
      description: 'Professional brake tuning, chain adjustment, gear alignment, and safety inspections for all kids bikes.',
      tag: 'Bicycles',
      accent: 'text-[#219EBC]',
      bg: 'bg-[#219EBC]/15'
    },
    {
      icon: BatteryCharging,
      title: 'Spare Parts & Battery Replacement',
      description: 'Authentic 6V/12V ride-on batteries, remote controllers, chargers, pedal switches, and replacement wheels.',
      tag: 'Spare Parts',
      accent: 'text-[#6A994E]',
      bg: 'bg-[#6A994E]/15'
    },
    {
      icon: Wrench,
      title: 'In-Store Quick Diagnostics',
      description: 'Bring your vehicle directly to our Payod showroom for hands-on evaluation and expert troubleshooting.',
      tag: 'At Showroom',
      accent: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

  const serviceWhatsAppUrl = createWhatsAppUrl(
    `Hi ${SHOP_FULL_NAME}, I would like to inquire about Electric Car/Bike/Gear Cycle Service and Spare Parts.`
  );

  return (
    <section id="care-services" className="py-14 sm:py-20 bg-amber-50/40 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FB8500]/15 text-[#FB8500] text-xs font-bold uppercase tracking-wider mb-2.5">
            <Wrench className="w-3.5 h-3.5" />
            <span>Support &amp; Maintenance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
            More Than Just a Toy Shop
          </h2>
          <p className="text-[#546E7A] text-sm sm:text-base mt-2">
            We're here even after you choose your product. Dedicated service, tuning &amp; spares in Payod.
          </p>
        </div>

        {/* 4 Verified Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {verifiedServices.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl card-shadow border border-black/5 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${svc.bg} ${svc.accent} flex items-center justify-center shadow-xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF9F0] px-2 py-0.5 rounded-full border border-black/5 text-[#546E7A]">
                      {svc.tag}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#263238] font-heading mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#546E7A] leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-semibold text-[#546E7A]">
                  <span>Available in Payod</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#FB8500]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Service Help Callout Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl card-shadow border border-[#FFB703]/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#263238] font-heading">
              Have an electric car or bicycle needing attention?
            </h3>
            <p className="text-xs sm:text-sm text-[#546E7A] mt-1">
              Contact our service technicians or bring it directly to our Payod store.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={serviceWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Inquire Service on WhatsApp</span>
            </a>

            <a
              href={`tel:${SHOP_PHONE_CALL}`}
              className="inline-flex items-center gap-1.5 bg-[#FFF9F0] hover:bg-black/5 border border-black/10 text-[#263238] px-4 py-2.5 rounded-full text-xs font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#FB8500]" />
              <span>Call ({SHOP_PHONE_DISPLAY})</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
