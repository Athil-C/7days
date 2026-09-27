import React from 'react';
import { Smile, Gift, Baby, MapPin } from 'lucide-react';

export default function TrustStrip() {
  const trustItems = [
    {
      emoji: '🧸',
      title: 'Fun for Kids',
      subtitle: 'Playful & engaging toys',
      bg: 'bg-[#FFB703]/15',
      accent: 'text-[#FB8500]',
    },
    {
      emoji: '🎁',
      title: 'Perfect Gifts',
      subtitle: 'Memorable birthday surprises',
      bg: 'bg-[#FB8500]/15',
      accent: 'text-[#FB8500]',
    },
    {
      emoji: '👶',
      title: 'Baby Essentials',
      subtitle: 'Gentle, safe & reliable',
      bg: 'bg-[#219EBC]/15',
      accent: 'text-[#219EBC]',
    },
    {
      emoji: '📍',
      title: 'Your Local Store',
      subtitle: 'Payod, Mananthavady',
      bg: 'bg-[#6A994E]/15',
      accent: 'text-[#6A994E]',
    },
  ];

  return (
    <section className="py-6 border-y border-[#263238]/5 bg-white/70 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl hover:bg-white transition-all duration-300 hover:shadow-xs group"
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${item.bg} flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <span>{item.emoji}</span>
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm sm:text-base font-bold text-[#263238] font-heading leading-tight truncate">
                  {item.title}
                </h4>
                <p className="text-xs text-[#546E7A] truncate mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
