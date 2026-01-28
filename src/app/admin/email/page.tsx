'use client';

import { useState } from 'react';
import { Plus, Edit, Send, Eye, Mail, Users, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockCampaigns = [
  { id: 1, name: 'January Sale Announcement', subject: 'Big Sale Starts Now - Up to 50% Off!', status: 'sent', sentAt: '2024-01-15', recipients: 2845, opens: 1256, clicks: 342 },
  { id: 2, name: 'New Arrivals - Beauty', subject: 'New Beauty Products Just Landed', status: 'sent', sentAt: '2024-01-10', recipients: 2312, opens: 987, clicks: 234 },
  { id: 3, name: 'Valentine\'s Day Preview', subject: 'Perfect Gifts for Valentine\'s Day', status: 'scheduled', scheduledFor: '2024-02-01', recipients: 2890, opens: 0, clicks: 0 },
  { id: 4, name: 'Wellness Week Promo', subject: 'Save 15% on Wellness Products', status: 'draft', recipients: 0, opens: 0, clicks: 0 },
];

export default function AdminEmailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Campaigns</h1>
          <p className="text-gray-600">Manage email marketing campaigns</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Subscribers</p>
                <p className="text-2xl font-bold">2,890</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold">12,450</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Open Rate</p>
                <p className="text-2xl font-bold">42.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <BarChart2 className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Click Rate</p>
                <p className="text-2xl font-bold">11.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{campaign.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{campaign.subject}</td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        campaign.status === 'sent' ? 'success' :
                        campaign.status === 'scheduled' ? 'default' : 'secondary'
                      }>
                        {campaign.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{campaign.recipients.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {campaign.opens > 0 ? (
                        <span>{campaign.opens.toLocaleString()} ({((campaign.opens / campaign.recipients) * 100).toFixed(1)}%)</span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {campaign.clicks > 0 ? (
                        <span>{campaign.clicks.toLocaleString()} ({((campaign.clicks / campaign.recipients) * 100).toFixed(1)}%)</span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {campaign.status === 'draft' && (
                          <>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-green-600">
                              <Send className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
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
