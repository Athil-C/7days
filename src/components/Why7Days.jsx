import React from 'react';
import { CheckCircle2, Sparkles, Smile, MapPin, Layers } from 'lucide-react';

export default function Why7Days() {
  const features = [
    {
      icon: CheckCircle2,
      title: 'Carefully Selected',
      description: 'Products chosen with kids and families in mind.',
      bgColor: 'bg-[#FFB703]/20',
      iconColor: 'text-[#FB8500]',
    },
    {
      icon: Layers,
      title: 'Something for Everyone',
      description: 'Toys, gifts, baby essentials and everyday kids\' needs.',
      bgColor: 'bg-[#FB8500]/20',
      iconColor: 'text-[#FB8500]',
    },
    {
      icon: Smile,
      title: 'Local & Friendly',
      description: 'A neighborhood store serving families in Wayanad.',
      bgColor: 'bg-[#6A994E]/20',
      iconColor: 'text-[#6A994E]',
    },
    {
      icon: MapPin,
      title: 'Easy to Reach',
      description: 'Find us in Payod, Mananthavady.',
      bgColor: 'bg-[#219EBC]/20',
      iconColor: 'text-[#219EBC]',
    },
  ];

  return (
    <section className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB703]/20 text-[#263238] text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FB8500]" />
            <span>The 7Days Difference</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
            Why Choose 7Days Toys &amp; Babyshop?
          </h2>
          <p className="text-[#546E7A] text-sm sm:text-base mt-2.5">
            Thoughtfully built for parents, gift seekers, and joyful kids in Wayanad.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 sm:p-7 rounded-3xl card-shadow border border-black/5 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300"
              >
                <div>
                  <div className={`w-13 h-13 rounded-2xl ${item.bgColor} flex items-center justify-center ${item.iconColor} mb-5 shadow-xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#263238] font-heading mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#546E7A] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
