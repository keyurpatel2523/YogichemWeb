import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Yogichem - Health & Beauty | Pharmacy & Prescriptions',
  description: 'Shop health, beauty, baby & wellness products. Free delivery on orders over £25. Next day delivery available.',
  keywords: 'pharmacy, health, beauty, skincare, makeup, wellness, baby, prescriptions',
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
