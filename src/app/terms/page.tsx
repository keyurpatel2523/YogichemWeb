export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003DA5] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Terms & Conditions</h1>
          <p className="text-blue-100">Last updated: January 2025</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          {[
            {
              title: '1. Acceptance of Terms',
              body: 'By accessing and using the Yogichem website, you accept and agree to be bound by these Terms & Conditions. If you do not agree, please do not use our website.',
            },
            {
              title: '2. Products & Pricing',
              body: 'All product descriptions and prices are accurate to the best of our knowledge. We reserve the right to change prices at any time. Prices shown include VAT where applicable.',
            },
            {
              title: '3. Orders & Contract',
              body: 'Placing an order constitutes an offer to purchase. A contract is formed when we send your order confirmation email. We reserve the right to cancel orders at our discretion.',
            },
            {
              title: '4. Payment',
              body: 'Payment is taken at the time of order. We accept major debit and credit cards and PayPal. All transactions are processed securely using industry-standard encryption.',
            },
            {
              title: '5. Delivery',
              body: 'Delivery times are estimates and we cannot guarantee specific delivery dates. Risk passes to you when the goods are delivered. See our Delivery Information page for full details.',
            },
            {
              title: '6. Returns & Refunds',
              body: 'You may return most items within 28 days of receipt. Refunds will be issued to the original payment method. See our Returns & Refunds policy for full details.',
            },
            {
              title: '7. Intellectual Property',
              body: 'All content on this website, including text, images, logos, and designs, is owned by Yogichem or its licensors and is protected by copyright law. Unauthorised use is prohibited.',
            },
            {
              title: '8. Limitation of Liability',
              body: 'To the maximum extent permitted by law, Yogichem shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.',
            },
            {
              title: '9. Governing Law',
              body: 'These Terms & Conditions are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the English courts.',
            },
            {
              title: '10. Changes to Terms',
              body: 'We reserve the right to update these Terms & Conditions at any time. Continued use of the website after changes are posted constitutes acceptance of the new terms.',
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-[#1A1A3E] mb-2">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
