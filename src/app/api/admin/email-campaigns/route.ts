import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '../../../../../server/db';
import { emailCampaigns, users } from '@shared/schema';
import { desc, eq } from 'drizzle-orm';
import { sendMail, FROM_NAME } from '@/utils/sendgridMail';
import { sanitizeCampaignHtml } from '@/lib/html-sanitize';

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

    const safeContent = sanitizeCampaignHtml(String(content));
    let status = 'draft';
    let sentAt: Date | null = null;
    let recipientCount = 0;
    let warning: string | null = null;

    if (sendNow) {
      let allUsers = await db
        .select({ id: users.id, email: users.email, firstName: users.firstName, createdAt: users.createdAt })
        .from(users)
        .where(eq(users.emailNotifications, true));

      if (audience === 'new') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        allUsers = allUsers.filter((user) => user.createdAt != null && user.createdAt >= thirtyDaysAgo);
      }

      const results = await Promise.allSettled(allUsers.map((user) =>
        sendMail({
          to: user.email,
          subject: String(subject).slice(0, 255),
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#003DA5;padding:24px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:22px">${FROM_NAME}</h1>
            </div>
            <div style="padding:32px 24px;background:#fff">${safeContent}</div>
            <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:12px;color:#888">
              © ${new Date().getFullYear()} ${FROM_NAME}. You're receiving this because you subscribed to our emails.
            </div>
          </div>`,
          text: safeContent.replace(/<[^>]*>/g, ''),
        })
      ));

      const delivered = results.filter((result) => result.status === 'fulfilled').length;
      if (delivered === 0) {
        status = 'draft';
        warning = allUsers.length === 0
          ? 'No subscribed customers matched this audience. The campaign was saved as a draft.'
          : 'Email is not configured or every send failed. The campaign was saved as a draft and was not marked sent.';
      } else {
        status = 'sent';
        sentAt = new Date();
        recipientCount = delivered;
        if (delivered < allUsers.length) {
          warning = `${delivered} of ${allUsers.length} emails were accepted by the mail provider.`;
        }
      }
    }

    const schedDate = !sendNow && scheduledAt ? new Date(scheduledAt) : null;
    if (!sendNow && schedDate) {
      warning = 'Saved with a schedule. There is no automatic sender, so this campaign will not go out by itself.';
    }

    const [campaign] = await db
      .insert(emailCampaigns)
      .values({
        name: name.trim(),
        subject: subject.trim(),
        content: safeContent,
        status: sendNow ? status : schedDate ? 'scheduled' : 'draft',
        scheduledAt: schedDate,
        sentAt,
        recipientCount,
        openCount: 0,
        clickCount: 0,
      })
      .returning();

    return NextResponse.json({ ...campaign, warning }, { status: 201 });
  } catch (error) {
    console.error('Error creating email campaign:', error);
    return NextResponse.json({ error: 'Failed to create email campaign' }, { status: 500 });
  }
}
