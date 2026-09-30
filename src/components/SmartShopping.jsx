import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Users, Coins, Search, Video, MessageCircle, Sparkles } from 'lucide-react';
import { createWhatsAppUrl, SHOP_FULL_NAME } from '../data/config';

export default function SmartShopping({ onSelectFinder }) {
  const navigate = useNavigate();

  const shoppingActions = [
    {
      id: 'gift',
      icon: Gift,
      title: 'Find a Gift',
      badge: 'Interactive',
      description: 'Step-by-step assistant for birthdays, milestones & celebrations.',
      actionType: 'scroll',
      targetId: 'gift-finder',
      bgClass: 'bg-amber-50 hover:bg-amber-100/70 border-amber-200/80',
      iconBg: 'bg-[#FB8500] text-white',
      accentColor: 'text-[#FB8500]'
    },
    {
      id: 'age',
      icon: Users,
      title: 'Shop by Age',
      badge: '0 to 12+ Yrs',
      description: 'Find products curated for babies, toddlers, preschoolers & teens.',
      actionType: 'scroll',
      targetId: 'shop-by-age',
      bgClass: 'bg-sky-50 hover:bg-sky-100/70 border-sky-200/80',
      iconBg: 'bg-[#219EBC] text-white',
      accentColor: 'text-[#219EBC]'
    },
    {
      id: 'budget',
      icon: Coins,
      title: 'Shop by Budget',
      badge: 'Flexible',
      description: 'Browse options under ₹500, ₹1,000, ₹2,500, or premium sets.',
      actionType: 'link',
      href: '/products',
      bgClass: 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200/80',
      iconBg: 'bg-[#6A994E] text-white',
      accentColor: 'text-[#6A994E]'
    },
    {
      id: 'search',
      icon: Search,
      title: 'Find a Product',
      badge: 'Smart Search',
      description: 'Search naturally for RC cars, cycles, dolls, walkers or backpacks.',
      actionType: 'link',
      href: '/products',
      bgClass: 'bg-orange-50 hover:bg-orange-100/70 border-orange-200/80',
      iconBg: 'bg-[#FB8500] text-white',
      accentColor: 'text-[#FB8500]'
    },
    {
      id: 'video',
      icon: Video,
      title: 'Ask for a Video',
      badge: 'Live Demo',
      description: 'Want to see an RC car, cycle, or toy in action? Message our staff.',
      actionType: 'whatsapp',
      whatsappMsg: `Hi ${SHOP_FULL_NAME}, I'd like to ask for a short video demonstration of a product I saw on your website!`,
      bgClass: 'bg-purple-50 hover:bg-purple-100/70 border-purple-200/80',
      iconBg: 'bg-purple-600 text-white',
      accentColor: 'text-purple-600'
    },
    {
      id: 'chat',
      icon: MessageCircle,
      title: 'Talk to 7Days',
      badge: 'Instant Help',
      description: 'Direct WhatsApp chat with our Payod store team for advice & availability check.',
      actionType: 'whatsapp',
      whatsappMsg: `Hi ${SHOP_FULL_NAME}, I have a quick question about toys and baby products at your Payod store.`,
      bgClass: 'bg-green-50 hover:bg-green-100/70 border-green-200/80',
      iconBg: 'bg-[#25D366] text-white',
      accentColor: 'text-[#25D366]'
    }
  ];

  const handleAction = (item) => {
    if (item.actionType === 'scroll') {
      const element = document.getElementById(item.targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      if (onSelectFinder && item.id === 'gift') {
        onSelectFinder('gift');
      }
    } else if (item.actionType === 'link') {
      navigate(item.href);
    } else if (item.actionType === 'whatsapp') {
      window.open(createWhatsAppUrl(item.whatsappMsg), '_blank', 'noopener,noreferrer');
    }
  };


  return (
    <section id="smart-shopping" className="py-12 sm:py-16 bg-white/70 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB703]/20 text-[#263238] text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FB8500]" />
            <span>Smart Shopping Assistant</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
            7Days Smart Shopping
          </h2>
          <p className="text-[#546E7A] text-sm sm:text-base mt-2">
            Not sure what to choose? Let us help you find the right toys & baby products.
          </p>
        </div>

        {/* 6 Interactive Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {shoppingActions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleAction(item)}
                type="button"
                className={`text-left p-5 sm:p-6 rounded-3xl border transition-all duration-300 card-shadow hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${item.bgClass}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${item.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white/80 text-[#263238] shadow-2xs border border-black/5">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-[#263238] font-heading mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#546E7A] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#263238]">
                  <span>Explore option</span>
                  <span className={item.accentColor}>→</span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
