'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const banners = [
  {
    id: 1,
    title: "Big Boots Sale!",
    subtitle: "Save up to 50% on beauty, healthcare & more",
    cta: "Shop All Sale",
    href: "/sale",
    bgColor: "bg-gradient-to-r from-boots-red to-pink-500",
    textColor: "text-white",
  },
  {
    id: 2,
    title: "Valentine's Day",
    subtitle: "Share the love with great gifts at low prices",
    cta: "Shop Gifts",
    href: "/category/gifts",
    bgColor: "bg-gradient-to-r from-pink-400 to-red-400",
    textColor: "text-white",
  },
  {
    id: 3,
    title: "Wellness Week",
    subtitle: "Save 15% on 100s of wellness favourites",
    cta: "Shop Wellness",
    href: "/category/wellness",
    bgColor: "bg-gradient-to-r from-boots-teal to-green-400",
    textColor: "text-white",
  },
  {
    id: 4,
    title: "Next Day Delivery",
    subtitle: "Order before 2PM for next day delivery",
    cta: "Learn More",
    href: "/delivery",
    bgColor: "bg-gradient-to-r from-boots-blue to-boots-lightBlue",
    textColor: "text-white",
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`min-w-full ${banner.bgColor} ${banner.textColor}`}
          >
            <div className="container mx-auto px-4 py-16 md:py-24">
              <div className="max-w-2xl">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{banner.title}</h1>
                <p className="text-lg md:text-xl mb-6 opacity-90">{banner.subtitle}</p>
                <Link href={banner.href}>
                  <Button size="lg" variant="secondary" className="font-semibold">
                    {banner.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
