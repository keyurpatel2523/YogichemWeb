import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { PromotionBanner } from '@/components/home/PromotionBanner';

export default function HomePage() {
  return (
    <div>
      <HeroBanner />
      <CategoryGrid />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-4">
          <PromotionBanner
            title="Fragrance Sale"
            subtitle="Save 20% on selected fragrance favourites with code SAVE20"
            cta="Shop Now"
            href="/category/beauty/fragrance"
            bgColor="bg-gradient-to-r from-purple-500 to-pink-500"
            badge="HURRY, TODAY ONLY!"
          />
          <PromotionBanner
            title="Wellness Week"
            subtitle="Save 15% across 100s of wellness favourites with code WELLNESS15"
            cta="Shop Now"
            href="/category/wellness"
            bgColor="bg-gradient-to-r from-boots-teal to-emerald-500"
            badge="SAVE 15%"
          />
        </div>
      </div>

      <FeaturedProducts title="Featured Products" type="featured" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-4">
          <PromotionBanner
            title="Electrical Beauty"
            subtitle="Save up to 60% on selected electrical beauty"
            cta="Shop Now"
            href="/category/electrical"
            bgColor="bg-gradient-to-r from-boots-blue to-indigo-600"
            badge="SAVE UP TO 60%"
          />
          <PromotionBanner
            title="Skincare Saviours"
            subtitle="Save up to 1/2 price on selected skincare"
            cta="Shop Now"
            href="/category/beauty/skincare"
            bgColor="bg-gradient-to-r from-pink-400 to-rose-500"
            badge="SAVE UP TO 1/2 PRICE"
          />
          <PromotionBanner
            title="Baby Essentials"
            subtitle="Save 15% when you spend £40 on selected baby using code BABY15"
            cta="Shop Now"
            href="/category/baby"
            bgColor="bg-gradient-to-r from-yellow-400 to-orange-400"
            badge="SAVE 15%"
          />
        </div>
      </div>

      <FeaturedProducts title="On Sale" type="sale" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-boots-navy text-white rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Sign up for exclusive offers</h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Be the first to know about new products, special offers, and exclusive deals. Plus, get 10% off your first order!
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-black"
            />
            <button
              type="submit"
              className="bg-boots-blue hover:bg-boots-lightBlue text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <FeaturedProducts title="New Arrivals" type="new" />
    </div>
  );
}
