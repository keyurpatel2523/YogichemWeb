'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
    toast({ title: 'Message sent!', description: 'We\'ll get back to you within 24 hours.' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003DA5] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-blue-100 text-lg">We're here to help — get in touch</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Contact info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1A1A3E]">Get in Touch</h2>
            {[
              { icon: Mail, label: 'Email', value: 'help@yogichem.com', href: 'mailto:help@yogichem.com' },
              { icon: Phone, label: 'Phone', value: '0800 123 4567', href: 'tel:08001234567' },
              { icon: MapPin, label: 'Head Office', value: '1 Yogichem Way, London, UK' },
              { icon: Clock, label: 'Support Hours', value: 'Mon–Fri 9AM–6PM' },
            ].map(({ icon: Icon, label, value, href }) => (
              <Card key={label}>
                <CardContent className="flex gap-3 items-start p-4">
                  <Icon className="w-5 h-5 text-[#003DA5] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-[#003DA5] font-medium hover:underline">{value}</a>
                    ) : (
                      <p className="text-sm text-gray-700">{value}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-[#1A1A3E] mb-6">Send Us a Message</h2>
                {sent ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Message Sent!</h3>
                    <p className="text-gray-500 text-sm mt-2">Thanks for reaching out. We'll reply within 24 hours.</p>
                    <Button variant="outline" className="mt-4" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                      Send Another
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                        <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                        <Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <Input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="How can we help?" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Please describe your query in detail..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      />
                    </div>
                    <Button type="submit" disabled={sending} className="w-full bg-[#003DA5] hover:bg-[#002d7a]">
                      {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
