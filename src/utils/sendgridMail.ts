import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'keyursuhani1530@gmail.com';
export const FROM_NAME = 'Yogichem';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'keyursuhani1530@gmail.com';

interface MailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  bccAdmin?: boolean;
}

export async function sendMail({ to, subject, html, text, bccAdmin = false }: MailPayload) {
  const msg: any = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    html,
    text,
  };

  if (bccAdmin && ADMIN_EMAIL && ADMIN_EMAIL !== to) {
    msg.bcc = ADMIN_EMAIL;
  }

  await sgMail.send(msg);
}
