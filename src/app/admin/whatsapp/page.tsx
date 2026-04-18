'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus, MessageSquare, Users, Phone, X, Send, Clock,
  FileText, Trash2, Check, AlertCircle, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/lib/admin-store';

const STATUS_COLORS: Record<string, string> = {
  sent: 'bg-green-100 text-green-700 border-green-200',
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
};

const emptyForm = {
  name: '',
  message: '',
  scheduleType: 'now',
  scheduledAt: '',
};

export default function AdminWhatsAppPage() {
  const { token } = useAdminStore();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ['admin', 'whatsapp-broadcasts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/whatsapp-broadcasts', { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to fetch broadcasts');
      return res.json();
    },
  });

  async function handleSave(sendNow: boolean) {
    if (!form.name.trim() || !form.message.trim()) {
      showToast('Broadcast name and message are required', 'error');
      return;
    }
    if (!sendNow && form.scheduleType === 'later' && !form.scheduledAt) {
      showToast('Please select a schedule date and time', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/whatsapp-broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          name: form.name,
          message: form.message,
          sendNow,
          scheduledAt: form.scheduleType === 'later' ? form.scheduledAt : null,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'whatsapp-broadcasts'] });
      setShowModal(false);
      setForm(emptyForm);
      showToast(sendNow ? 'Broadcast saved as sent!' : form.scheduleType === 'later' ? 'Broadcast scheduled!' : 'Broadcast saved as draft');
    } catch (err: any) {
      showToast(err.message || 'Failed to save broadcast', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/whatsapp-broadcasts/${deleteId}`, {
        method: 'DELETE', headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to delete');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'whatsapp-broadcasts'] });
      setDeleteId(null);
      showToast('Broadcast deleted');
    } catch {
      showToast('Failed to delete broadcast', 'error');
    } finally {
      setDeleting(false);
    }
  }

  const sentCount = broadcasts.filter((b: any) => b.status === 'sent').length;
  const totalRecipients = broadcasts.reduce((s: number, b: any) => s + (b.recipientCount || 0), 0);

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent';

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Broadcasts</h1>
          <p className="text-gray-600">Create and manage WhatsApp message broadcasts to your customers</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          New Broadcast
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <strong>WhatsApp Business API required for actual sending.</strong> You can create and log broadcasts here. To enable real WhatsApp message delivery, connect a WhatsApp Business API provider (e.g. Twilio, 360dialog) and update the broadcast send logic.
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: <MessageSquare className="w-6 h-6 text-green-600" />, bg: 'bg-green-100', label: 'Total Broadcasts', value: broadcasts.length },
          { icon: <Send className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-100', label: 'Sent', value: sentCount },
          { icon: <Users className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-100', label: 'Total Recipients', value: totalRecipients },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 ${stat.bg} rounded-full`}>{stat.icon}</div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Broadcast List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Broadcast History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-10 text-gray-500">Loading broadcasts...</p>
          ) : broadcasts.length === 0 ? (
            <div className="text-center py-14">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No broadcasts yet</p>
              <p className="text-gray-400 text-sm mb-4">Create your first WhatsApp broadcast</p>
              <Button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />New Broadcast
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Message</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Recipients</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {broadcasts.map((b: any) => (
                    <tr key={b.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{b.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-[240px]">
                        <p className="truncate">{b.message}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={STATUS_COLORS[b.status] || STATUS_COLORS.draft}>{b.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{b.recipientCount || 0}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {b.sentAt
                          ? new Date(b.sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : b.scheduledAt
                          ? `Scheduled: ${new Date(b.scheduledAt).toLocaleDateString('en-GB')}`
                          : new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setPreview(b)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Preview">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Broadcast Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg"><MessageSquare className="w-5 h-5 text-green-600" /></div>
                <h2 className="text-lg font-bold">New WhatsApp Broadcast</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Broadcast Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Broadcast Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale Reminder" className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">Internal name — customers won't see this</p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  maxLength={1600}
                  placeholder="Hi {first_name}! 👋 Yogichem here. Our summer sale is now on — up to 30% off! Shop now: https://yogichem.replit.app/sale"
                  className={`${inputClass} resize-none`}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-400">WhatsApp supports plain text only — no HTML</p>
                  <span className={`text-xs ${form.message.length > 1400 ? 'text-orange-500' : 'text-gray-400'}`}>{form.message.length}/1600</span>
                </div>
              </div>

              {/* Recipients note */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <Phone className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">
                  This broadcast will be sent to all customers who have <strong>WhatsApp notifications enabled</strong> in their account settings.
                </p>
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">When to Send</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="scheduleType" value="now" checked={form.scheduleType === 'now'} onChange={() => setForm({ ...form, scheduleType: 'now' })} className="accent-green-600" />
                    <Send className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Mark as Sent Now</p>
                      <p className="text-xs text-gray-500">Log immediately (requires WhatsApp Business API for actual sending)</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="scheduleType" value="later" checked={form.scheduleType === 'later'} onChange={() => setForm({ ...form, scheduleType: 'later' })} className="accent-green-600" />
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Schedule for Later</p>
                      <p className="text-xs text-gray-500">Save with a scheduled date</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="scheduleType" value="draft" checked={form.scheduleType === 'draft'} onChange={() => setForm({ ...form, scheduleType: 'draft' })} className="accent-green-600" />
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Save as Draft</p>
                      <p className="text-xs text-gray-500">Save without sending</p>
                    </div>
                  </label>
                </div>
                {form.scheduleType === 'later' && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Schedule Date & Time</label>
                    <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className={inputClass} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl sticky bottom-0">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
              {form.scheduleType !== 'now' ? (
                <Button onClick={() => handleSave(false)} disabled={saving} className="bg-[#003DA5] hover:bg-[#002d7a] min-w-[140px]">
                  {saving ? 'Saving...' : form.scheduleType === 'later' ? 'Schedule Broadcast' : 'Save Draft'}
                </Button>
              ) : (
                <Button onClick={() => handleSave(true)} disabled={saving} className="bg-green-600 hover:bg-green-700 min-w-[140px]">
                  <Send className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Broadcast'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold">Broadcast Preview</h2>
              <button onClick={() => setPreview(null)} className="p-1.5 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <p><span className="font-semibold">Name:</span> {preview.name}</p>
                <p><span className="font-semibold">Status:</span> {preview.status} | <span className="font-semibold">Recipients:</span> {preview.recipientCount}</p>
              </div>
              {/* WhatsApp bubble mock */}
              <div className="bg-[#e5ddd5] rounded-xl p-4">
                <div className="bg-white rounded-xl rounded-tl-none p-3 shadow text-sm max-w-[280px] whitespace-pre-wrap">
                  {preview.message}
                  <p className="text-xs text-gray-400 text-right mt-1">{preview.sentAt ? new Date(preview.sentAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--'} ✓✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Broadcast?</h3>
              <p className="text-gray-500 text-sm">This broadcast will be permanently deleted.</p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
              <Button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
