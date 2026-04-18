import { RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003DA5] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Returns & Refunds</h1>
          <p className="text-blue-100 text-lg">Easy returns within 28 days of purchase</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#1A1A3E] mb-4">Our Returns Policy</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              We want you to be completely happy with your purchase. If you're not satisfied for any reason, you can return most items within <strong>28 days</strong> of receipt for a full refund or exchange.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              {[
                { icon: Clock, label: '28-day returns window', color: 'text-[#003DA5]' },
                { icon: CheckCircle, label: 'Free returns on eligible orders', color: 'text-[#00A550]' },
                { icon: RotateCcw, label: 'Refund within 5–7 business days', color: 'text-[#FF6B00]' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="text-center p-4 bg-gray-50 rounded-lg">
                  <Icon className={`w-7 h-7 mx-auto mb-2 ${color}`} />
                  <p className="text-xs font-medium text-gray-700">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#1A1A3E] mb-4">What Can & Cannot Be Returned</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-semibold text-green-800">Eligible for return</p>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {['Unopened products in original packaging', 'Faulty or damaged items', 'Items that arrived incorrectly', 'Electrical items (unopened)', 'Gifts with receipt'].map(i => (
                    <li key={i} className="flex gap-2"><span className="text-green-500">✓</span>{i}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <p className="font-semibold text-red-700">Not eligible for return</p>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {['Opened cosmetics or skincare', 'Pierced jewellery', 'Personalised items', 'Perishable goods', 'Items without original packaging'].map(i => (
                    <li key={i} className="flex gap-2"><span className="text-red-400">✗</span>{i}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#1A1A3E] mb-4">How to Return an Item</h2>
            <ol className="space-y-4">
              {[
                { step: '1', title: 'Contact us', desc: 'Get in touch via our Contact Us page or email help@yogichem.com with your order number and reason for return.' },
                { step: '2', title: 'Pack your item', desc: 'Securely pack the item in its original packaging if possible. Include your order number inside the parcel.' },
                { step: '3', title: 'Send it back', desc: 'We\'ll provide a prepaid returns label by email. Drop it off at your nearest post office or collection point.' },
                { step: '4', title: 'Receive your refund', desc: 'Once we receive and inspect your return, your refund will be processed within 5–7 business days to your original payment method.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#003DA5] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{step}</div>
                  <div>
                    <p className="font-semibold text-[#1A1A3E]">{title}</p>
                    <p className="text-sm text-gray-600 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </ol>
            <div className="mt-6">
              <Link href="/contact">
                <Button className="bg-[#003DA5] hover:bg-[#002d7a]">Start a Return</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
