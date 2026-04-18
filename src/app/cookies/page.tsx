export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003DA5] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Cookie Policy</h1>
          <p className="text-blue-100">Last updated: January 2025</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          {[
            {
              title: '1. What Are Cookies?',
              body: 'Cookies are small text files placed on your device when you visit a website. They help the website remember your preferences and improve your experience.',
            },
            {
              title: '2. How We Use Cookies',
              body: 'We use cookies to keep you signed in, remember your basket contents, understand how you use our site, and show you relevant products and offers.',
            },
            {
              title: '3. Types of Cookies We Use',
              body: '',
              table: [
                ['Essential', 'Required for the website to function — login sessions, basket contents.', 'Always active'],
                ['Analytics', 'Help us understand how visitors interact with our site.', 'Optional'],
                ['Marketing', 'Used to deliver relevant advertisements.', 'Optional'],
                ['Preferences', 'Remember your settings and preferences.', 'Optional'],
              ],
            },
            {
              title: '4. Managing Cookies',
              body: 'You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of the website. Most browsers allow you to refuse cookies or delete existing ones.',
            },
            {
              title: '5. Third-Party Cookies',
              body: 'Some cookies on our site are set by third-party services such as analytics providers and payment processors. These are subject to the respective third-party privacy policies.',
            },
            {
              title: '6. Updates to This Policy',
              body: 'We may update this Cookie Policy from time to time. We will notify you of significant changes by updating the date at the top of this page.',
            },
            {
              title: '7. Contact Us',
              body: 'If you have questions about our use of cookies, please contact us at help@yogichem.com.',
            },
          ].map(({ title, body, table }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-[#1A1A3E] mb-2">{title}</h2>
              {body && <p className="text-sm text-gray-600 leading-relaxed">{body}</p>}
              {table && (
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-sm border rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold text-gray-700">Type</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-700">Purpose</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {table.map(([type, purpose, status]) => (
                        <tr key={type}>
                          <td className="px-4 py-2 font-medium text-gray-800">{type}</td>
                          <td className="px-4 py-2 text-gray-600">{purpose}</td>
                          <td className="px-4 py-2 text-gray-500">{status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
