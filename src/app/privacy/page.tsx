export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003DA5] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-blue-100">Last updated: January 2025</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-sm text-gray-700">
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          {[
            {
              title: '1. Who We Are',
              body: 'Yogichem ("we", "us", "our") is a health and beauty retailer. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website or services.',
            },
            {
              title: '2. Information We Collect',
              body: 'We collect information you provide when creating an account or placing an order — including your name, email address, phone number, delivery address, and payment details. We also collect browsing and usage data automatically.',
            },
            {
              title: '3. How We Use Your Information',
              body: 'We use your information to process and fulfil orders, send order confirmations and updates, personalise your shopping experience, improve our website, send marketing communications (with your consent), and comply with legal obligations.',
            },
            {
              title: '4. Sharing Your Information',
              body: 'We do not sell your personal data. We share information only with trusted partners who help us operate our business — such as payment processors and delivery companies — under strict confidentiality agreements.',
            },
            {
              title: '5. Cookies',
              body: 'We use cookies to improve your experience, analyse site traffic, and enable personalised content. You can manage your cookie preferences at any time. See our Cookie Policy for more details.',
            },
            {
              title: '6. Data Retention',
              body: 'We retain your personal data for as long as your account is active or as needed to provide services. You can request deletion of your account and data at any time by contacting us.',
            },
            {
              title: '7. Your Rights',
              body: 'Under UK GDPR you have the right to access, correct, or delete your personal data; object to or restrict processing; and data portability. Contact us at help@yogichem.com to exercise these rights.',
            },
            {
              title: '8. Security',
              body: 'We use industry-standard encryption and security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.',
            },
            {
              title: '9. Contact Us',
              body: 'If you have any questions about this Privacy Policy, please contact our Data Protection Officer at privacy@yogichem.com or write to Yogichem, 1 Yogichem Way, London, UK.',
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
