'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, MessageSquare, Users, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/lib/admin-store';

export default function AdminWhatsAppPage() {
  const { token } = useAdminStore();

  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ['admin', 'whatsapp-broadcasts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/whatsapp-broadcasts', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch broadcasts');
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Broadcasts</h1>
          <p className="text-gray-600">Manage WhatsApp marketing messages</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Broadcast
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Broadcasts</p>
                <p className="text-2xl font-bold">{isLoading ? '...' : broadcasts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '...' : broadcasts.reduce((sum: number, b: any) => sum + (b.recipientCount || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '...' : broadcasts.filter((b: any) => b.status === 'sent').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Broadcast History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading broadcasts...</p>
          ) : broadcasts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Message</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Recipients</th>
                  </tr>
                </thead>
                <tbody>
                  {broadcasts.map((broadcast: any) => (
                    <tr key={broadcast.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{broadcast.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{broadcast.message}</td>
                      <td className="py-3 px-4">
                        <Badge variant={broadcast.status === 'sent' ? 'default' : broadcast.status === 'scheduled' ? 'outline' : 'secondary'}>
                          {broadcast.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{broadcast.recipientCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No broadcasts yet. Create your first WhatsApp broadcast.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
