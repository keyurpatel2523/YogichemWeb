import { Truck, Clock, MapPin, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003DA5] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Delivery Information</h1>
          <p className="text-blue-100 text-lg">Everything you need to know about getting your order</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#1A1A3E] mb-5">Delivery Options</h2>
            <div className="space-y-5">
              {[
                {
                  icon: Package,
                  title: 'Standard Delivery',
                  time: '3–5 business days',
                  price: '£3.50 (FREE on orders over £25)',
                  color: 'text-[#003DA5]',
                  detail: 'Your order will be dispatched within 1 business day and delivered by Royal Mail or DPD.',
                },
                {
                  icon: Clock,
                  title: 'Next Day Delivery',
                  time: 'Next business day',
                  price: '£4.95',
                  color: 'text-[#FF6B00]',
                  detail: 'Order before 2PM Monday–Friday for guaranteed next business day delivery. Not available on bank holidays.',
                },
                {
                  icon: MapPin,
                  title: 'Click & Collect',
                  time: 'Ready in 2 hours',
                  price: 'FREE on orders over £15',
                  color: 'text-[#00A550]',
                  detail: 'Collect from your nearest Yogichem store. You\'ll receive an email when your order is ready to collect.',
                },
              ].map(({ icon: Icon, title, time, price, color, detail }) => (
                <div key={title} className="flex gap-4 p-4 border rounded-lg">
                  <Icon className={`w-8 h-8 flex-shrink-0 mt-1 ${color}`} />
                  <div>
                    <p className="font-bold text-[#1A1A3E]">{title}</p>
                    <p className="text-sm text-gray-500">{time} · {price}</p>
                    <p className="text-sm text-gray-600 mt-2">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#1A1A3E] mb-4">International Delivery</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-semibold text-gray-700">Country</th>
                    <th className="pb-2 font-semibold text-gray-700">Delivery Time</th>
                    <th className="pb-2 font-semibold text-gray-700">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-600">
                  {[
                    ['Ireland', '3–5 days', '£5.99'],
                    ['France', '5–7 days', '£8.99'],
                    ['Germany', '5–7 days', '£8.99'],
                    ['United States', '7–14 days', '£14.99'],
                  ].map(([country, time, price]) => (
                    <tr key={country}>
                      <td className="py-2">{country}</td>
                      <td className="py-2">{time}</td>
                      <td className="py-2">{price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3">Customs charges may apply for international orders. These are the buyer's responsibility.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-bold text-[#1A1A3E] mb-2">Important Information</h2>
            {[
              'Delivery times are estimates and may vary during busy periods such as Christmas or bank holidays.',
              'A signature may be required for high-value orders.',
              'If you\'re not in when your order arrives, the carrier will leave a card with redelivery instructions.',
              'PO box addresses are not accepted for next day or tracked deliveries.',
            ].map((item) => (
              <div key={item} className="flex gap-2 text-sm text-gray-600">
                <span className="text-[#003DA5] font-bold flex-shrink-0">•</span>
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
