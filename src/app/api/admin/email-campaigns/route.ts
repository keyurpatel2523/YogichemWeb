import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '../../../../../server/db';
import { emailCampaigns, users } from '@shared/schema';
import { desc, eq } from 'drizzle-orm';
import { sendMail, FROM_NAME } from '@/utils/sendgridMail';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const campaigns = await db
      .select()
      .from(emailCampaigns)
      .orderBy(desc(emailCampaigns.createdAt));
    return NextResponse.json(campaigns);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch email campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, subject, content, audience, sendNow, scheduledAt } = body;

    if (!name?.trim() || !subject?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Name, subject, and content are required' }, { status: 400 });
    }

    let status = 'draft';
    let sentAt: Date | null = null;
    let recipientCount = 0;

    if (sendNow) {
      // Fetch recipients based on audience
      let allUsers = await db
        .select({ id: users.id, email: users.email, firstName: users.firstName })
        .from(users)
        .where(eq(users.emailNotifications, true));

      if (audience === 'new') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        allUsers = allUsers.filter((u) => new Date(u.email) > thirtyDaysAgo);
      }

      // Send emails (fire and forget per recipient)
      const sendPromises = allUsers.map((user) =>
        sendMail({
          to: user.email,
          subject,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#003DA5;padding:24px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:22px">${FROM_NAME}</h1>
            </div>
            <div style="padding:32px 24px;background:#fff">${content}</div>
            <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:12px;color:#888">
              © ${new Date().getFullYear()} ${FROM_NAME}. You're receiving this because you subscribed to our emails.
            </div>
          </div>`,
          text: content.replace(/<[^>]*>/g, ''),
        }).catch(() => null)
      );

      await Promise.allSettled(sendPromises);
      status = 'sent';
      sentAt = new Date();
      recipientCount = allUsers.length;
    }

    const schedDate = !sendNow && scheduledAt ? new Date(scheduledAt) : null;

    const [campaign] = await db
      .insert(emailCampaigns)
      .values({
        name: name.trim(),
        subject: subject.trim(),
        content: content.trim(),
        status: sendNow ? 'sent' : schedDate ? 'scheduled' : 'draft',
        scheduledAt: schedDate,
        sentAt,
        recipientCount,
        openCount: 0,
        clickCount: 0,
      })
      .returning();

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating email campaign:', error);
    return NextResponse.json({ error: 'Failed to create email campaign' }, { status: 500 });
  }
}
