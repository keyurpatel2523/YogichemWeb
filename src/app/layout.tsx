import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yogichem.co.uk'),
  title: {
    default: 'Yogichem - Health & Beauty',
    template: '%s | Yogichem',
  },
  description: 'Shop health, beauty, baby and wellness products. Free UK delivery on orders over £25. Next day delivery available before 2PM.',
  keywords: ['pharmacy', 'health', 'beauty', 'skincare', 'wellness', 'baby'],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Yogichem',
    title: 'Yogichem - Health & Beauty',
    description: 'Shop health, beauty, baby and wellness products. Free UK delivery on orders over £25.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
