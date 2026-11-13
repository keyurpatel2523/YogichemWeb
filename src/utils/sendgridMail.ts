import sgMail from '@sendgrid/mail';

interface MailConfig {
  from: string;
  admin: string;
}

function mailConfig(): MailConfig {
  const apiKey = process.env.SENDGRID_API_KEY || '';
  const from = process.env.SENDGRID_FROM_EMAIL || '';
  if (!apiKey || !from) {
    throw new Error('Email is not configured. Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL.');
  }
  sgMail.setApiKey(apiKey);
  return {
    from,
    admin: process.env.ADMIN_EMAIL || '',
  };
}

export const FROM_NAME = 'Yogichem';

interface MailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  bccAdmin?: boolean;
}

export async function sendMail({ to, subject, html, text, bccAdmin = false }: MailPayload) {
  const config = mailConfig();
  const msg: sgMail.MailDataRequired = {
    to,
    from: { email: config.from, name: FROM_NAME },
    subject,
    html,
    text,
  };

  if (bccAdmin && config.admin && config.admin !== to) {
    msg.bcc = config.admin;
  }

  await sgMail.send(msg);
}
