'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Mail, Phone, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const FAQS = [
  {
    q: 'How do I place an order?',
    a: 'Browse our products, add items to your basket, and proceed to checkout. You can pay by card or PayPal. You\'ll receive an email confirmation once your order is placed.',
  },
  {
    q: 'What are the delivery options?',
    a: 'We offer Standard Delivery (3–5 business days), Next Day Delivery (order before 2PM), and Click & Collect. Free standard delivery on orders over £25.',
  },
  {
    q: 'Can I track my order?',
    a: 'Yes! Once dispatched you\'ll receive a tracking number by email. You can also track your order from the Track Your Order page or your account.',
  },
  {
    q: 'How do I return an item?',
    a: 'Items can be returned within 28 days of purchase in their original condition. Visit our Returns & Refunds page for full details and to start a return.',
  },
  {
    q: 'How do I use a coupon code?',
    a: 'At the checkout, enter your coupon code in the "Coupon / Promo code" field and click Apply. The discount will be applied to your order total.',
  },
  {
    q: 'Is my personal information secure?',
    a: 'Yes. We use industry-standard encryption to protect your data. We never share your personal information with third parties without your consent.',
  },
  {
    q: 'Can I change or cancel my order?',
    a: 'Orders can be cancelled or amended before they are dispatched. Please contact us as soon as possible via the Contact Us page.',
  },
  {
    q: 'Do you offer a loyalty programme?',
    a: 'Yes — your Yogichem Wallet earns credit on every purchase. Visit the Wallet section of your account to check your balance.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left text-sm font-semibold text-[#1A1A3E] hover:text-[#003DA5] transition-colors"
        onClick={() => setOpen(!open)}
      >
        {q}
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
      </button>
      {open && <p className="pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003DA5] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Help & FAQs</h1>
          <p className="text-blue-100 text-lg">Find answers to your questions</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="shadow-md mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#1A1A3E] mb-4">Frequently Asked Questions</h2>
            {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-[#1A1A3E] mb-4">Still need help?</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Mail, label: 'Email Us', value: 'help@yogichem.com', href: 'mailto:help@yogichem.com' },
            { icon: Phone, label: 'Call Us', value: '0800 123 4567', href: 'tel:08001234567' },
            { icon: MessageCircle, label: 'Live Chat', value: 'Chat with us', href: '/contact' },
          ].map(({ icon: Icon, label, value, href }) => (
            <a key={label} href={href} className="block">
              <Card className="hover:shadow-md transition-shadow text-center">
                <CardContent className="p-5">
                  <Icon className="w-8 h-8 text-[#003DA5] mx-auto mb-2" />
                  <p className="font-semibold text-sm text-[#1A1A3E]">{label}</p>
                  <p className="text-xs text-gray-500 mt-1">{value}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
