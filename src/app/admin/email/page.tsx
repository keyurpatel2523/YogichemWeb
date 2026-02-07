'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, Mail, Users, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/lib/admin-store';

export default function AdminEmailPage() {
  const { token } = useAdminStore();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['admin', 'email-campaigns'],
    queryFn: async () => {
      const res = await fetch('/api/admin/email-campaigns', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Campaigns</h1>
          <p className="text-gray-600">Manage email marketing campaigns</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold">{isLoading ? '...' : campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '...' : campaigns.reduce((sum: number, c: any) => sum + (c.recipientCount || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Opens</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '...' : campaigns.reduce((sum: number, c: any) => sum + (c.openCount || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading campaigns...</p>
          ) : campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Campaign</th>
                    <th className="text-left py-3 px-4">Subject</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Recipients</th>
                    <th className="text-left py-3 px-4">Opens</th>
                    <th className="text-left py-3 px-4">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign: any) => (
                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{campaign.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{campaign.subject}</td>
                      <td className="py-3 px-4">
                        <Badge variant={campaign.status === 'sent' ? 'default' : campaign.status === 'scheduled' ? 'outline' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{campaign.recipientCount || 0}</td>
                      <td className="py-3 px-4">{campaign.openCount || 0}</td>
                      <td className="py-3 px-4">{campaign.clickCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No campaigns yet. Create your first email campaign.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
