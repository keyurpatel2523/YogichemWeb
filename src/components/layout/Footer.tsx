import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-boots-navy text-white mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Shop</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/category/beauty" className="hover:text-white transition-colors">Beauty</Link></li>
              <li><Link href="/category/health" className="hover:text-white transition-colors">Health</Link></li>
              <li><Link href="/category/baby" className="hover:text-white transition-colors">Baby & Child</Link></li>
              <li><Link href="/category/wellness" className="hover:text-white transition-colors">Wellness</Link></li>
              <li><Link href="/category/electrical" className="hover:text-white transition-colors">Electrical</Link></li>
              <li><Link href="/sale" className="hover:text-white transition-colors text-boots-red">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/help" className="hover:text-white transition-colors">Help & FAQs</Link></li>
              <li><Link href="/delivery" className="hover:text-white transition-colors">Delivery Information</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition-colors">Track Your Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">My Account</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link href="/account/wallet" className="hover:text-white transition-colors">Wallet</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>0800 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>help@bootsshop.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span>Mon-Fri: 8am-8pm<br />Sat-Sun: 9am-5pm</span>
              </li>
            </ul>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="hover:text-boots-lightBlue transition-colors"><Facebook className="w-6 h-6" /></a>
              <a href="#" className="hover:text-boots-lightBlue transition-colors"><Twitter className="w-6 h-6" /></a>
              <a href="#" className="hover:text-boots-lightBlue transition-colors"><Instagram className="w-6 h-6" /></a>
              <a href="#" className="hover:text-boots-lightBlue transition-colors"><Youtube className="w-6 h-6" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold">BootsShop</div>
            <div className="text-gray-400 text-sm text-center md:text-left">
              © 2024 BootsShop. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
