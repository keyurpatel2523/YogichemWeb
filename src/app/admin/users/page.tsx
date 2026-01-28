'use client';

import { useState } from 'react';
import { Search, Eye, Mail, User as UserIcon, Shield, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';

const mockUsers = [
  { id: 1, firstName: 'John', lastName: 'Smith', email: 'john@example.com', phone: '+44 7700 900123', isWholesaler: false, walletBalance: '25.50', orders: 12, createdAt: '2023-06-15' },
  { id: 2, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com', phone: '+44 7700 900456', isWholesaler: true, walletBalance: '150.00', orders: 45, createdAt: '2023-03-22' },
  { id: 3, firstName: 'Emma', lastName: 'Wilson', email: 'emma@example.com', phone: '+44 7700 900789', isWholesaler: false, walletBalance: '0.00', orders: 3, createdAt: '2024-01-05' },
  { id: 4, firstName: 'Michael', lastName: 'Brown', email: 'michael@example.com', phone: '+44 7700 900012', isWholesaler: false, walletBalance: '42.75', orders: 28, createdAt: '2023-08-10' },
  { id: 5, firstName: 'Lisa', lastName: 'Davis', email: 'lisa@example.com', phone: '+44 7700 900345', isWholesaler: true, walletBalance: '320.00', orders: 89, createdAt: '2022-11-30' },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');

  const filteredUsers = mockUsers.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-gray-600">Manage customer accounts</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">3,420</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Wholesalers</p>
                <p className="text-2xl font-bold">124</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Wallet Balance</p>
                <p className="text-2xl font-bold">{formatPrice(12540)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email Subscribers</p>
                <p className="text-2xl font-bold">2,890</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Wallet</th>
                  <th className="text-left py-3 px-4">Orders</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </td>
                    <td className="py-3 px-4 text-sm">{user.phone}</td>
                    <td className="py-3 px-4">
                      <Badge variant={user.isWholesaler ? 'default' : 'outline'}>
                        {user.isWholesaler ? 'Wholesaler' : 'Customer'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">{formatPrice(user.walletBalance)}</td>
                    <td className="py-3 px-4">{user.orders}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
