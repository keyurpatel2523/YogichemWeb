'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Gift, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

interface Transaction {
  id: number;
  type: string;
  amount: string;
  description: string | null;
  orderId: number | null;
  createdAt: string;
}

const typeConfig: Record<string, { icon: any; color: string; label: string; sign: string }> = {
  credit:   { icon: TrendingUp,   color: 'text-green-600', label: 'Credit',   sign: '+' },
  debit:    { icon: TrendingDown, color: 'text-red-600',   label: 'Debit',    sign: '−' },
  refund:   { icon: Gift,         color: 'text-blue-600',  label: 'Refund',   sign: '+' },
  purchase: { icon: ShoppingBag,  color: 'text-gray-600',  label: 'Purchase', sign: '−' },
};

export default function WalletPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useUserStore();
  const [balance, setBalance] = useState('0.00');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/account/wallet');
      return;
    }
    fetch('/api/wallet', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        setBalance(d.balance || '0.00');
        setTransactions(d.transactions || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, router, token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Account</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">My Wallet</h1>
            <p className="text-gray-600 text-sm">Your Yogichem wallet balance and history</p>
          </div>
        </div>

        <Card className="mb-6 bg-boots-blue text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-1">
              <Wallet className="w-6 h-6 opacity-80" />
              <span className="text-sm opacity-80">Available Balance</span>
            </div>
            {loading ? (
              <div className="h-10 w-32 bg-white/20 rounded animate-pulse" />
            ) : (
              <p className="text-4xl font-bold">{formatPrice(balance)}</p>
            )}
            <p className="text-xs opacity-60 mt-2">Wallet funds are applied automatically at checkout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center py-3">
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="font-medium text-gray-700">No transactions yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Wallet credits are awarded on purchases and promotions.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {transactions.map((tx) => {
                  const cfg = typeConfig[tx.type] || typeConfig.credit;
                  const Icon = cfg.icon;
                  const date = new Date(tx.createdAt);
                  const isPositive = tx.type === 'credit' || tx.type === 'refund';
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-gray-100 ${cfg.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description || cfg.label}</p>
                          <p className="text-xs text-gray-500">
                            {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-gray-800'}`}>
                        {cfg.sign}{formatPrice(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
