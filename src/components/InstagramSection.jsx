import React from 'react';
import { ExternalLink } from 'lucide-react';
import { InstagramIcon } from './Icons';
import { SHOP_INSTAGRAM_URL } from '../data/config';

export default function InstagramSection() {
  const instagramPosts = [
    {
      id: 1,
      image: "/products/kids-sport-bicycle.jpg",
      caption: "Kids sport bicycles with training wheels and front baskets! 🚲🌟"
    },
    {
      id: 2,
      image: "/products/rc-stunt-car.jpg",
      caption: "High-speed 2.4GHz RC monster racers for thrilling playtime! 🏎️💨"
    },
    {
      id: 3,
      image: "/products/kids-toy-drone.jpg",
      caption: "Kids mini toy drones with 360° propeller safety guards & LED lights! 🚁✨"
    },
    {
      id: 4,
      image: "/products/baby-canopy-tricycle.jpg",
      caption: "Canopy baby tricycles with parent steerable push handle bar! 👶🍼"
    },
    {
      id: 5,
      image: "/products/panda-magic-swing-car.jpg",
      caption: "Original panda magic swing twister cars in store! 🐼🚗"
    },
    {
      id: 6,
      image: "/products/kids-activity-table.jpg",
      caption: "Multi-activity kids study tables & building block desks! 🎨📚"
    },
  ];

  return (
    <section className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1306C]/10 text-[#E1306C] text-xs font-bold uppercase tracking-wider mb-2.5">
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>@7days_toys</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
            Follow 7Days Toys on Instagram
          </h2>
          <p className="text-[#546E7A] text-sm sm:text-base mt-2">
            See new arrivals, store reels, and toy updates from our Payod shop.
          </p>
        </div>

        {/* 6-Image Social Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href={SHOP_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-white shadow-xs focus:outline-none block border border-black/5"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                decoding="async"
                width="200"
                height="200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
                <InstagramIcon className="w-5 h-5 text-white mb-1.5" />
                <p className="text-[11px] font-medium line-clamp-2 leading-tight">
                  {post.caption}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* Follow CTA Button */}
        <div className="text-center">
          <a
            href={SHOP_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#E1306C] to-[#FD1D1D] hover:opacity-95 text-white px-7 py-3 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Follow @7days_toys</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

      </div>
    </section>
  );
}
