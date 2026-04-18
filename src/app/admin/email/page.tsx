'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Mail, Users, BarChart2, X, Send, Clock, FileText,
  Trash2, Check, AlertCircle, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/lib/admin-store';

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Customers (email notifications on)' },
  { value: 'new', label: 'New Customers (last 30 days)' },
];

const STATUS_COLORS: Record<string, string> = {
  sent: 'bg-green-100 text-green-700 border-green-200',
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
};

const emptyForm = {
  name: '',
  subject: '',
  content: '',
  audience: 'all',
  scheduleType: 'now',
  scheduledAt: '',
};

export default function AdminEmailPage() {
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

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['admin', 'email-campaigns'],
    queryFn: async () => {
      const res = await fetch('/api/admin/email-campaigns', { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      return res.json();
    },
  });

  async function handleSave(sendNow: boolean) {
    if (!form.name.trim() || !form.subject.trim() || !form.content.trim()) {
      showToast('Campaign name, subject, and content are required', 'error');
      return;
    }
    if (!sendNow && form.scheduleType === 'later' && !form.scheduledAt) {
      showToast('Please select a schedule date and time', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          name: form.name,
          subject: form.subject,
          content: form.content,
          audience: form.audience,
          sendNow,
          scheduledAt: form.scheduleType === 'later' ? form.scheduledAt : null,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'email-campaigns'] });
      setShowModal(false);
      setForm(emptyForm);
      showToast(sendNow ? 'Campaign sent successfully!' : form.scheduleType === 'later' ? 'Campaign scheduled!' : 'Campaign saved as draft');
    } catch (err: any) {
      showToast(err.message || 'Failed to save campaign', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/email-campaigns/${deleteId}`, {
        method: 'DELETE', headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to delete');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'email-campaigns'] });
      setDeleteId(null);
      showToast('Campaign deleted');
    } catch {
      showToast('Failed to delete campaign', 'error');
    } finally {
      setDeleting(false);
    }
  }

  const totalRecipients = campaigns.reduce((s: number, c: any) => s + (c.recipientCount || 0), 0);
  const totalOpens = campaigns.reduce((s: number, c: any) => s + (c.openCount || 0), 0);
  const sentCount = campaigns.filter((c: any) => c.status === 'sent').length;

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent';
  const selectClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003DA5]';

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
          <h1 className="text-2xl font-bold">Email Campaigns</h1>
          <p className="text-gray-600">Create and send email marketing campaigns to your customers</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="bg-[#003DA5] hover:bg-[#002d7a]">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { icon: <Mail className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-100', label: 'Total Campaigns', value: campaigns.length },
          { icon: <Send className="w-6 h-6 text-green-600" />, bg: 'bg-green-100', label: 'Sent', value: sentCount },
          { icon: <Users className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-100', label: 'Total Recipients', value: totalRecipients },
          { icon: <BarChart2 className="w-6 h-6 text-orange-600" />, bg: 'bg-orange-100', label: 'Total Opens', value: totalOpens },
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

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#003DA5]" />
            Campaign History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-10 text-gray-500">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-14">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No campaigns yet</p>
              <p className="text-gray-400 text-sm mb-4">Create your first email campaign to get started</p>
              <Button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="bg-[#003DA5] hover:bg-[#002d7a]">
                <Plus className="w-4 h-4 mr-2" />New Campaign
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Campaign</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Subject</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Recipients</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Opens</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{c.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-[220px] truncate">{c.subject}</td>
                      <td className="py-3 px-4">
                        <Badge className={STATUS_COLORS[c.status] || STATUS_COLORS.draft}>{c.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{c.recipientCount || 0}</td>
                      <td className="py-3 px-4 text-sm">{c.openCount || 0}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {c.sentAt
                          ? new Date(c.sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : c.scheduledAt
                          ? `Scheduled: ${new Date(c.scheduledAt).toLocaleDateString('en-GB')}`
                          : new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setPreview(c)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="Preview">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete">
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

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Mail className="w-5 h-5 text-[#003DA5]" /></div>
                <h2 className="text-lg font-bold">New Email Campaign</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Campaign Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale 2025" className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">Internal name — customers won't see this</p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject Line <span className="text-red-500">*</span></label>
                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. 🛍 Up to 30% off this weekend!" className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">This is what customers see in their inbox</p>
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target Audience</label>
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className={selectClass}>
                  {AUDIENCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Content <span className="text-red-500">*</span></label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  placeholder="Write your email message here. You can use basic HTML for formatting, e.g.:&#10;&#10;<h2>Big Summer Sale!</h2>&#10;<p>Get up to 30% off all beauty products this weekend.</p>&#10;<p><a href='https://yogichem.replit.app/sale'>Shop the sale &rarr;</a></p>"
                  className={`${inputClass} resize-none font-mono text-xs`}
                />
                <p className="text-xs text-gray-400 mt-1">You can use basic HTML. Leave blank for plain text.</p>
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">When to Send</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="scheduleType" value="now" checked={form.scheduleType === 'now'} onChange={() => setForm({ ...form, scheduleType: 'now' })} className="accent-[#003DA5]" />
                    <Send className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Send Now</p>
                      <p className="text-xs text-gray-500">Email is sent immediately to all opted-in customers</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="scheduleType" value="later" checked={form.scheduleType === 'later'} onChange={() => setForm({ ...form, scheduleType: 'later' })} className="accent-[#003DA5]" />
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Schedule for Later</p>
                      <p className="text-xs text-gray-500">Save as scheduled (actual sending requires a scheduler)</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="scheduleType" value="draft" checked={form.scheduleType === 'draft'} onChange={() => setForm({ ...form, scheduleType: 'draft' })} className="accent-[#003DA5]" />
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

              {form.scheduleType === 'now' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <strong>Note:</strong> The email will be sent immediately via SendGrid to all customers who have email notifications enabled. This cannot be undone.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl sticky bottom-0">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
              {form.scheduleType !== 'now' && (
                <Button variant="outline" onClick={() => handleSave(false)} disabled={saving} className="border-gray-300">
                  {saving ? 'Saving...' : form.scheduleType === 'later' ? 'Schedule Campaign' : 'Save Draft'}
                </Button>
              )}
              {form.scheduleType === 'now' && (
                <Button onClick={() => handleSave(true)} disabled={saving} className="bg-green-600 hover:bg-green-700 min-w-[140px]">
                  <Send className="w-4 h-4 mr-2" />
                  {saving ? 'Sending...' : 'Send Campaign'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold">Campaign Preview</h2>
              <button onClick={() => setPreview(null)} className="p-1.5 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p><span className="font-semibold">Campaign:</span> {preview.name}</p>
                <p><span className="font-semibold">Subject:</span> {preview.subject}</p>
                <p><span className="font-semibold">Status:</span> {preview.status} | <span className="font-semibold">Recipients:</span> {preview.recipientCount}</p>
              </div>
              <div className="border rounded-lg p-4 bg-white">
                <div className="bg-[#003DA5] text-white text-center py-4 rounded-t-lg font-bold text-lg mb-4">Yogichem</div>
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: preview.content }} />
                <div className="mt-4 pt-4 border-t text-xs text-gray-400 text-center">© {new Date().getFullYear()} Yogichem</div>
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Campaign?</h3>
              <p className="text-gray-500 text-sm">This campaign will be permanently deleted.</p>
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
