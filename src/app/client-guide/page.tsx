'use client';

export default function ClientGuidePage() {
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .page-break { page-break-before: always; }
        }
        body { font-family: Arial, sans-serif; }
      `}</style>

      {/* Print Button — hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          style={{ background: '#003DA5', color: '#fff', padding: '10px 22px', borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          Download PDF
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px', fontFamily: 'Arial, sans-serif', color: '#1a1a1a', fontSize: 13, lineHeight: 1.6 }}>

        {/* Cover */}
        <div style={{ textAlign: 'center', padding: '60px 0 40px', borderBottom: '3px solid #003DA5', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: '#003DA5', color: '#fff', padding: '14px 32px', borderRadius: 8, fontSize: 28, fontWeight: 800, letterSpacing: 2, marginBottom: 16 }}>
            YOGICHEM
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#003DA5', margin: '12px 0 6px' }}>Admin & Website Guide</h1>
          <p style={{ color: '#555', fontSize: 14 }}>Complete reference for managing your Yogichem store — April 2025</p>
        </div>

        {/* Table of Contents */}
        <Section title="Contents">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
            {[
              ['Part 1', 'Website — Customer Facing'],
              ['Part 2', 'Admin Dashboard Login'],
              ['Part 3', 'Dashboard Overview'],
              ['Part 4', 'Products Management'],
              ['Part 5', 'Categories Management'],
              ['Part 6', 'Orders Management'],
              ['Part 7', 'Users / Customers'],
              ['Part 8', 'Promotions & Coupons'],
              ['Part 9', 'Shipping Rules'],
              ['Part 10', 'Email & WhatsApp'],
              ['Part 11', 'Analytics'],
              ['Part 12', 'Settings'],
              ['Part 13', 'Order Emails'],
              ['Part 14', 'Quick Reference'],
            ].map(([num, label]) => (
              <div key={num} style={{ padding: '4px 0', borderBottom: '1px dotted #ddd', display: 'flex', gap: 8 }}>
                <span style={{ color: '#003DA5', fontWeight: 600, minWidth: 52 }}>{num}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* PART 1 — WEBSITE */}
        <div className="page-break" />
        <PartHeading number="Part 1" title="Website — Customer Facing" color="#003DA5" />
        <InfoBox label="Website URL" value="https://yogichem.replit.app" />

        <Section title="All Website Pages">
          <Table
            headers={['Page', 'URL', 'Purpose']}
            rows={[
              ['Homepage', '/', 'Main landing — hero banner, featured products, sale items'],
              ['Beauty', '/category/beauty', 'All beauty products'],
              ['Health', '/category/health', 'All health products'],
              ['Baby & Child', '/category/baby', 'All baby & child products'],
              ['Wellness', '/category/wellness', 'All wellness products'],
              ['Electrical', '/category/electrical', 'All electrical products'],
              ['Gifts', '/category/gifts', 'All gift products'],
              ['Sale', '/sale', 'All products currently on sale'],
              ['Offers', '/offers', 'Active coupon codes + featured products'],
              ['Product Page', '/product/[name]', 'Individual product detail page'],
              ['Search', '/search', 'Search results'],
              ['Cart / Basket', '/cart', 'Shopping basket'],
              ['Checkout', '/checkout', '3-step checkout (address → delivery → payment)'],
              ['Sign In', '/login', 'Customer login'],
              ['Register', '/register', 'New customer registration'],
              ['My Account', '/account', 'Account overview'],
              ['My Orders', '/account/orders', 'Full order history'],
              ['Order Detail', '/account/orders/[id]', 'Single order with items & tracking'],
              ['My Addresses', '/account/addresses', 'Saved delivery addresses (add/edit/delete/set default)'],
              ['Wishlist', '/wishlist', 'Saved / wishlisted products'],
              ['My Wallet', '/account/wallet', 'Wallet balance & transaction history'],
              ['Profile', '/account/profile', 'Edit name, email, phone, password'],
              ['Notifications', '/account/notifications', 'Email & WhatsApp notification preferences'],
              ['Settings', '/account/settings', 'Danger zone — delete account'],
              ['Track Order', '/track-order', 'Track order by number + email'],
              ['Help & FAQs', '/help', 'Frequently asked questions'],
              ['Delivery Info', '/delivery', 'Delivery options, timings, prices'],
              ['Returns', '/returns', 'Returns policy & how to return'],
              ['Contact Us', '/contact', 'Contact form + phone/email'],
              ['Privacy Policy', '/privacy', 'Full privacy policy'],
              ['Terms & Conditions', '/terms', 'Full terms and conditions'],
              ['Cookie Policy', '/cookies', 'Cookie usage policy'],
            ]}
          />
        </Section>

        <Section title="How Customers Shop">
          <Steps steps={[
            ['Browse', 'Use the category menu at the top or the search bar to find products.'],
            ['Add to Basket', 'Click "Add to Basket" on any product page.'],
            ['Checkout Step 1 — Shipping', 'Address auto-fills from the saved default address if logged in. Phone number auto-fills from the profile.'],
            ['Checkout Step 2 — Delivery', 'Choose Standard Delivery, Next Day Delivery (order before 2PM), or Click & Collect.'],
            ['Checkout Step 3 — Payment', 'Enter card details or choose PayPal.'],
            ['Order Confirmation', 'Customer receives a branded email confirmation with full order details. Admin receives a BCC copy.'],
          ]} />
        </Section>

        <Section title="Active Coupon Codes">
          <Table
            headers={['Code', 'Discount']}
            rows={[
              ['SAVE20', '20% off entire order'],
              ['WELLNESS15', '15% off wellness products'],
              ['BABY15', '15% off baby & child products'],
              ['FREESHIP', 'Free shipping on any order'],
              ['WELCOME10', '10% off for new customers'],
            ]}
          />
          <p style={{ color: '#555', marginTop: 8, fontSize: 12 }}>Customers enter these codes at checkout. You can manage and add new codes in Admin → Promotions.</p>
        </Section>

        {/* PART 2 — ADMIN LOGIN */}
        <div className="page-break" />
        <PartHeading number="Part 2" title="Admin Dashboard Login" color="#003DA5" />
        <InfoBox label="Admin Login URL" value="https://yogichem.replit.app/admin/login" />
        <Table
          headers={['Field', 'Value']}
          rows={[
            ['Email', 'admin@yogichem.com'],
            ['Password', 'admin123'],
          ]}
        />
        <div style={{ background: '#fff8e1', border: '1px solid #f59e0b', borderRadius: 6, padding: '10px 14px', marginTop: 12, fontSize: 12, color: '#92400e' }}>
          <strong>Security Notice:</strong> Please change the default admin password after your first login. Go to Admin → Settings.
        </div>

        {/* PART 3 — DASHBOARD */}
        <PartHeading number="Part 3" title="Dashboard Overview" color="#003DA5" />
        <p style={{ color: '#555', marginBottom: 12 }}>The Dashboard is the first screen you see after logging in. It gives a live snapshot of your store.</p>
        <Table
          headers={['Item', 'What it Shows']}
          rows={[
            ['Total Revenue', 'Total money earned from all orders combined'],
            ['Total Orders', 'Number of orders placed'],
            ['Total Customers', 'Number of registered customer accounts'],
            ['Total Products', 'Number of products in your catalogue'],
            ['Sales Chart', 'Bar chart showing revenue over time'],
            ['Category Breakdown', 'Pie chart showing which categories sell the most'],
            ['Recent Orders', 'Latest orders with status and amount'],
            ['Low Stock Alerts', 'Products below their minimum stock threshold'],
          ]}
        />

        {/* PART 4 — PRODUCTS */}
        <div className="page-break" />
        <PartHeading number="Part 4" title="Products Management" color="#003DA5" />
        <InfoBox label="URL" value="/admin/products" />

        <Section title="Product List">
          <p style={{ color: '#555', marginBottom: 8 }}>Shows all products with image, name, price, stock, and status. You can search, edit, or delete any product.</p>
          <Table
            headers={['Button / Column', 'What it Does']}
            rows={[
              ['Search bar', 'Filter products by name in real time'],
              ['Add New Product', 'Opens the Add Product form'],
              ['Edit icon (pencil)', 'Opens the Edit form for that product'],
              ['Delete icon (bin)', 'Permanently deletes the product after confirmation'],
              ['Status badge', 'Shows whether the product is Active, Inactive, or On Sale'],
            ]}
          />
        </Section>

        <Section title="Add / Edit Product — Field Guide">
          <SubHeading>Basic Information</SubHeading>
          <Table
            headers={['Field', 'What to Enter', 'Required']}
            rows={[
              ['Product Name', 'Full product name e.g. "Rose Hip Vitamin C Serum"', 'Yes'],
              ['URL Slug', 'Auto-generated from the name — unique web address (e.g. rose-hip-vitamin-c-serum)', 'Yes'],
              ['Short Description', '1–2 sentence summary shown on product cards and search results', 'No'],
              ['Description', 'Full product description — ingredients, how to use, benefits', 'No'],
              ['SKU', 'Your internal stock keeping unit code', 'No'],
              ['Tags', 'Comma-separated keywords e.g. vitamin c, serum, brightening', 'No'],
            ]}
          />
          <SubHeading>Pricing</SubHeading>
          <Table
            headers={['Field', 'What to Enter', 'Required']}
            rows={[
              ['Selling Price', 'The price customers pay e.g. 9.99', 'Yes'],
              ['Compare At Price', 'Original / RRP price — shows as a strikethrough e.g. 14.99', 'No'],
              ['Cost Price', 'What you paid for this product (your cost)', 'No'],
              ['Wholesale Price', 'Price for wholesale customers', 'No'],
            ]}
          />
          <SubHeading>Stock & Category</SubHeading>
          <Table
            headers={['Field', 'What to Enter', 'Required']}
            rows={[
              ['Category', 'Select from dropdown: Beauty, Health, Baby & Child, Wellness, Electrical, Gifts', 'Yes'],
              ['Stock Quantity', 'How many units you currently have in stock e.g. 50', 'Yes'],
              ['Low Stock Threshold', 'You get a dashboard alert when stock falls below this number e.g. 10', 'Yes'],
            ]}
          />
          <SubHeading>Product Flags (On/Off Toggles)</SubHeading>
          <Table
            headers={['Toggle', 'What it Does']}
            rows={[
              ['Active', 'ON = product is visible on the website. OFF = hidden from customers.'],
              ['Featured', 'ON = appears in the "Featured Products" section on the homepage.'],
              ['On Sale', 'ON = shows a red SALE badge and appears on the Sale page.'],
              ['Sale Percentage', 'Discount percentage shown when On Sale is active e.g. 20 for 20% off.'],
            ]}
          />
          <SubHeading>Images</SubHeading>
          <Table
            headers={['Field', 'What to Enter']}
            rows={[
              ['Product Image', 'Upload PNG, JPG, or WebP — max 5MB. Drag & drop or click to browse. A preview shows immediately.'],
            ]}
          />
          <SubHeading>SEO (Search Engine Optimisation)</SubHeading>
          <Table
            headers={['Field', 'What to Enter']}
            rows={[
              ['Meta Title', 'Page title shown in Google results e.g. Rose Hip Vitamin C Serum — Yogichem'],
              ['Meta Description', 'Short summary shown in Google results — max 160 characters'],
            ]}
          />
        </Section>

        {/* PART 5 — CATEGORIES */}
        <div className="page-break" />
        <PartHeading number="Part 5" title="Categories Management" color="#003DA5" />
        <InfoBox label="URL" value="/admin/categories" />
        <p style={{ color: '#555', marginBottom: 12 }}>Manage the product categories shown in the top navigation menu.</p>
        <Table
          headers={['Field', 'What to Enter', 'Required']}
          rows={[
            ['Category Name', 'e.g. Beauty, Wellness, Skincare', 'Yes'],
            ['URL Slug', 'Auto-generated web path e.g. beauty', 'Yes'],
            ['Description', 'Short description of this category', 'No'],
            ['Image', 'Upload a banner or icon image for the category', 'No'],
            ['Parent Category', 'Choose a parent to make this a sub-category e.g. Skincare under Beauty', 'No'],
            ['Active', 'Toggle ON to show the category on the website', 'Yes'],
          ]}
        />

        {/* PART 6 — ORDERS */}
        <PartHeading number="Part 6" title="Orders Management" color="#003DA5" />
        <InfoBox label="URL" value="/admin/orders" />
        <p style={{ color: '#555', marginBottom: 12 }}>View and manage all customer orders. Use the search bar to find by order number or customer name. Use the status filter to narrow results.</p>
        <Table
          headers={['Status', 'Meaning']}
          rows={[
            ['Pending', 'Order placed — awaiting action from you'],
            ['Processing', 'Order is being packed / prepared'],
            ['Shipped', 'Order has been dispatched to the customer'],
            ['Delivered', 'Order successfully delivered'],
            ['Cancelled', 'Order was cancelled'],
          ]}
        />
        <p style={{ color: '#555', marginTop: 8, fontSize: 12 }}>Click on any order row to expand it and update the status using the dropdown.</p>

        {/* PART 7 — USERS */}
        <div className="page-break" />
        <PartHeading number="Part 7" title="Users / Customers" color="#003DA5" />
        <InfoBox label="URL" value="/admin/users" />
        <Table
          headers={['Column', 'What it Shows']}
          rows={[
            ['Name', "Customer's full name"],
            ['Email', 'Registered email address'],
            ['Phone', 'Phone number from profile'],
            ['Joined', 'Date they registered'],
            ['Orders', 'Total number of orders placed'],
            ['Total Spent', 'Lifetime spend amount'],
            ['Wholesaler', 'Whether wholesale pricing is enabled for this customer'],
          ]}
        />
        <p style={{ color: '#555', marginTop: 8, fontSize: 12 }}>You can toggle Wholesaler status on/off for any customer to give them wholesale pricing.</p>

        {/* PART 8 — PROMOTIONS */}
        <PartHeading number="Part 8" title="Promotions & Coupon Codes" color="#003DA5" />
        <InfoBox label="URL" value="/admin/promotions" />
        <p style={{ color: '#555', marginBottom: 12 }}>Create and manage discount coupon codes. Customers enter these at checkout.</p>
        <Table
          headers={['Field', 'What to Enter', 'Required']}
          rows={[
            ['Coupon Code', 'The code customers type at checkout e.g. SUMMER25 — uppercase, no spaces', 'Yes'],
            ['Discount Type', 'Percentage (e.g. 20% off) or Fixed Amount (e.g. £5 off)', 'Yes'],
            ['Discount Value', 'The amount — e.g. 20 for 20% or 5 for £5 off', 'Yes'],
            ['Minimum Order Amount', 'Basket must be at least this value to use the code e.g. 15.00. Leave blank for no minimum.', 'No'],
            ['Usage Limit', 'Maximum number of times the code can be redeemed in total e.g. 100', 'No'],
            ['Active', 'Toggle ON to enable, OFF to disable the coupon', 'Yes'],
          ]}
        />

        {/* PART 9 — SHIPPING */}
        <div className="page-break" />
        <PartHeading number="Part 9" title="Shipping Rules" color="#003DA5" />
        <InfoBox label="URL" value="/admin/shipping" />
        <p style={{ color: '#555', marginBottom: 12 }}>Set delivery costs and options for each country you ship to.</p>
        <Table
          headers={['Field', 'What to Enter', 'Required']}
          rows={[
            ['Country Name', 'Full country name e.g. United Kingdom', 'Yes'],
            ['Country Code', '2-letter code e.g. GB, FR, DE, IE, US', 'Yes'],
            ['Standard Shipping Cost', 'Cost in £ e.g. 3.50', 'Yes'],
            ['Standard Delivery Days', 'Estimated delivery time in days e.g. 3', 'Yes'],
            ['Free Shipping Threshold', 'Orders above this value get free shipping e.g. 25.00', 'No'],
            ['Next Day Available', 'Toggle ON if next day delivery is offered for this country', 'No'],
            ['Next Day Cost', 'Cost for next day delivery e.g. 4.95', 'No'],
            ['Click & Collect Available', 'Toggle ON if click & collect is available for this country', 'No'],
          ]}
        />

        {/* PART 10 — EMAIL & WHATSAPP */}
        <PartHeading number="Part 10" title="Email & WhatsApp Marketing" color="#003DA5" />

        <Section title="Email Campaigns — /admin/email">
          <Table
            headers={['Field', 'What to Enter']}
            rows={[
              ['Campaign Name', 'Internal name for this campaign e.g. Summer Sale Email'],
              ['Subject Line', 'The email subject customers will see in their inbox'],
              ['Target Audience', 'All Customers, New Customers, Loyal Customers, etc.'],
              ['Email Body', 'Write the message (supports formatted text / HTML)'],
              ['Schedule', 'Send immediately or schedule for a future date and time'],
            ]}
          />
        </Section>

        <Section title="WhatsApp Broadcasts — /admin/whatsapp">
          <Table
            headers={['Field', 'What to Enter']}
            rows={[
              ['Message', 'The WhatsApp message to send to customers'],
              ['Target Group', 'All opted-in customers or a specific segment'],
              ['Schedule', 'Send immediately or schedule'],
            ]}
          />
        </Section>

        {/* PART 11 — ANALYTICS */}
        <div className="page-break" />
        <PartHeading number="Part 11" title="Analytics" color="#003DA5" />
        <InfoBox label="URL" value="/admin/analytics" />
        <p style={{ color: '#555', marginBottom: 12 }}>Visual charts and reports. Use the date range selector at the top to filter by time period.</p>
        <Table
          headers={['Chart', 'What it Shows']}
          rows={[
            ['Sales Over Time', 'Revenue trend across days, weeks, or months'],
            ['Orders Over Time', 'Number of orders trend over time'],
            ['Category Breakdown', 'Which categories generate the most revenue'],
            ['Top Products', 'Best-selling products by quantity and revenue'],
            ['Customer Growth', 'New customer registrations over time'],
          ]}
        />

        {/* PART 12 — SETTINGS */}
        <PartHeading number="Part 12" title="Settings" color="#003DA5" />
        <InfoBox label="URL" value="/admin/settings" />

        <Section title="Store Information">
          <Table
            headers={['Field', 'What to Enter']}
            rows={[
              ['Store Name', 'Your store name e.g. Yogichem'],
              ['Contact Email', 'Main store email e.g. help@yogichem.com'],
              ['Phone Number', 'Store contact phone number'],
              ['Currency', 'Currently GBP (£)'],
              ['Timezone', 'Currently Europe/London'],
            ]}
          />
        </Section>

        <Section title="Order Settings">
          <Table
            headers={['Field', 'What to Enter']}
            rows={[
              ['Minimum Order Amount', 'Lowest basket value a customer can checkout with e.g. 10.00'],
              ['Free Shipping Threshold', 'Orders above this value receive free standard delivery e.g. 25.00'],
              ['Next Day Cut-off Hour', 'Orders placed before this time get next day delivery e.g. 14 = 2PM'],
            ]}
          />
        </Section>

        <Section title="Feature Toggles">
          <Table
            headers={['Toggle', 'What it Does']}
            rows={[
              ['Enable Email Notifications', 'Turns on/off automatic order confirmation emails to customers'],
              ['Enable WhatsApp', 'Turns on/off WhatsApp messaging integration'],
              ['Maintenance Mode', 'Takes the website offline — customers see a coming soon message'],
            ]}
          />
        </Section>

        {/* PART 13 — EMAILS */}
        <div className="page-break" />
        <PartHeading number="Part 13" title="Automatic Order Emails" color="#003DA5" />
        <p style={{ color: '#555', marginBottom: 12 }}>Every time a customer places an order, two emails are sent automatically — one to the customer and one to the admin.</p>

        <Section title="Customer Email Contains">
          <ul style={{ paddingLeft: 20, color: '#555', margin: 0 }}>
            {['Order number', 'Full list of items ordered with quantities and prices', 'Delivery address', 'Delivery method chosen (Standard / Next Day / Click & Collect)', 'Payment method', 'Subtotal, shipping cost, discount applied, and grand total', '"View Your Order" button linking to their account'].map(i => (
              <li key={i} style={{ marginBottom: 4 }}>{i}</li>
            ))}
          </ul>
        </Section>

        <Table
          headers={['Setting', 'Value']}
          rows={[
            ['Email sent from', 'keyursuhani1530@gmail.com'],
            ['Customer receives', 'Full order confirmation at the email entered at checkout'],
            ['Admin receives', 'A BCC copy of every order to keyursuhani1530@gmail.com'],
          ]}
        />
        <p style={{ color: '#555', marginTop: 8, fontSize: 12 }}>To change the admin notification email, update the ADMIN_EMAIL setting in the Replit Secrets panel.</p>

        {/* PART 14 — QUICK REFERENCE */}
        <div className="page-break" />
        <PartHeading number="Part 14" title="Quick Reference" color="#003DA5" />

        <Section title="Important URLs">
          <Table
            headers={['Purpose', 'URL']}
            rows={[
              ['Website', 'https://yogichem.replit.app'],
              ['Admin Dashboard', 'https://yogichem.replit.app/admin'],
              ['Admin Login', 'https://yogichem.replit.app/admin/login'],
            ]}
          />
        </Section>

        <Section title="Quick Steps — Add a New Product">
          <Steps steps={[
            ['Go to', 'Admin → Products → Add New Product'],
            ['Enter', 'Product Name, Price, Category, Stock quantity'],
            ['Upload', 'A product image (PNG or JPG, max 5MB)'],
            ['Toggle', '"Active" to ON so customers can see it'],
            ['Optional', 'Toggle "Featured" ON for homepage, "On Sale" ON with a Sale % for sale items'],
            ['Save', 'Click Save Product — it appears on the website immediately'],
          ]} />
        </Section>

        <Section title="Quick Steps — Create a Coupon Code">
          <Steps steps={[
            ['Go to', 'Admin → Promotions → Add Coupon'],
            ['Enter', 'A coupon code e.g. SUMMER25 (no spaces, uppercase)'],
            ['Choose', 'Discount Type: Percentage or Fixed Amount'],
            ['Enter', 'Discount Value e.g. 25 for 25% off or 5 for £5 off'],
            ['Set', 'Minimum Order Amount if needed (optional)'],
            ['Toggle', '"Active" to ON and click Save'],
          ]} />
        </Section>

        <Section title="Quick Steps — Update an Order Status">
          <Steps steps={[
            ['Go to', 'Admin → Orders'],
            ['Find', 'The order by number or customer name'],
            ['Click', 'The order row to expand it'],
            ['Change', 'The Status dropdown to Processing, Shipped, Delivered, or Cancelled'],
            ['Save', 'The status updates immediately'],
          ]} />
        </Section>

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 20, borderTop: '2px solid #003DA5', textAlign: 'center', color: '#888', fontSize: 12 }}>
          <strong style={{ color: '#003DA5' }}>Yogichem</strong> — Admin & Website Guide — April 2025<br />
          For technical support, contact your developer.
        </div>

      </div>
    </>
  );
}

function PartHeading({ number, title, color }: { number: string; title: string; color: string }) {
  return (
    <div style={{ background: color, color: '#fff', borderRadius: 8, padding: '14px 20px', margin: '32px 0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 4, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{number}</span>
      <span style={{ fontSize: 17, fontWeight: 700 }}>{title}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#003DA5', borderBottom: '1px solid #e0e0e0', paddingBottom: 6, marginBottom: 10 }}>{title}</h3>
      {children}
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <p style={{ fontWeight: 700, color: '#1a1a3e', margin: '12px 0 6px', fontSize: 13 }}>{children}</p>;
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#f0f4ff', border: '1px solid #c7d7f5', borderRadius: 6, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>{label}:</span>
      <code style={{ background: '#003DA5', color: '#fff', padding: '2px 10px', borderRadius: 4, fontSize: 13, fontWeight: 700 }}>{value}</code>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 12 }}>
      <thead>
        <tr style={{ background: '#003DA5', color: '#fff' }}>
          {headers.map(h => (
            <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9ff', borderBottom: '1px solid #e8e8e8' }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '7px 10px', color: j === 0 ? '#1a1a3e' : '#555', fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Steps({ steps }: { steps: [string, string][] }) {
  return (
    <ol style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
      {steps.map(([action, detail], i) => (
        <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'flex-start' }}>
          <span style={{ background: '#003DA5', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
          <div>
            <span style={{ fontWeight: 700, color: '#1a1a3e' }}>{action}: </span>
            <span style={{ color: '#555' }}>{detail}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
