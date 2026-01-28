'use client';

import { useState } from 'react';
import { Plus, Edit, Send, Eye, MessageSquare, Users, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockBroadcasts = [
  { id: 1, name: 'Flash Sale Alert', message: 'Flash Sale! 50% off all beauty products for the next 24 hours. Shop now!', status: 'sent', sentAt: '2024-01-15', recipients: 1245 },
  { id: 2, name: 'Order Shipped Batch', message: 'Great news! Your order has been shipped and is on its way.', status: 'sent', sentAt: '2024-01-14', recipients: 89 },
  { id: 3, name: 'Valentine\'s Reminder', message: 'Don\'t forget Valentine\'s Day! Shop our gift guide for the perfect present.', status: 'scheduled', scheduledFor: '2024-02-10', recipients: 1890 },
  { id: 4, name: 'Wellness Week Promo', message: 'Save 15% on all wellness products this week with code WELLNESS15', status: 'draft', recipients: 0 },
];

const mockContacts = [
  { id: 1, name: 'John Smith', phone: '+44 7700 900123', optedIn: true, lastMessage: '2024-01-15' },
  { id: 2, name: 'Sarah Johnson', phone: '+44 7700 900456', optedIn: true, lastMessage: '2024-01-14' },
  { id: 3, name: 'Emma Wilson', phone: '+44 7700 900789', optedIn: false, lastMessage: null },
];

export default function AdminWhatsAppPage() {
  const [activeTab, setActiveTab] = useState<'broadcasts' | 'contacts'>('broadcasts');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Management</h1>
          <p className="text-gray-600">Manage WhatsApp broadcasts and contacts</p>
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
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Opted-In Contacts</p>
                <p className="text-2xl font-bold">1,890</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Messages Sent</p>
                <p className="text-2xl font-bold">4,567</p>
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
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold">98.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'broadcasts' ? 'border-boots-blue text-boots-blue' : 'border-transparent text-gray-500'
          }`}
        >
          Broadcasts
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'contacts' ? 'border-boots-blue text-boots-blue' : 'border-transparent text-gray-500'
          }`}
        >
          Contacts
        </button>
      </div>

      {activeTab === 'broadcasts' && (
        <Card>
          <CardHeader>
            <CardTitle>Broadcast Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Message</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Recipients</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBroadcasts.map((broadcast) => (
                    <tr key={broadcast.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{broadcast.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{broadcast.message}</td>
                      <td className="py-3 px-4">
                        <Badge variant={
                          broadcast.status === 'sent' ? 'success' :
                          broadcast.status === 'scheduled' ? 'default' : 'secondary'
                        }>
                          {broadcast.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{broadcast.recipients.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {broadcast.status === 'draft' && (
                            <Button variant="ghost" size="icon" className="text-green-600">
                              <Send className="w-4 h-4" />
                            </Button>
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
      )}

      {activeTab === 'contacts' && (
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Last Message</th>
                  </tr>
                </thead>
                <tbody>
                  {mockContacts.map((contact) => (
                    <tr key={contact.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{contact.name}</td>
                      <td className="py-3 px-4">{contact.phone}</td>
                      <td className="py-3 px-4">
                        <Badge variant={contact.optedIn ? 'success' : 'secondary'}>
                          {contact.optedIn ? 'Opted In' : 'Opted Out'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {contact.lastMessage || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
