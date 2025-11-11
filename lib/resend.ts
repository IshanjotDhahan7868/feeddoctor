/**
 * Wrapper around the Resend API. In demo mode this does nothing.
 */
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY || '';
export const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail(options: { to: string; subject: string; html: string; text?: string }) {
  if (!resend) {
    console.log('Email not sent (demo mode):', options);
    return;
  }
  await resend.emails.send({
    from: 'FeedDoctor <no-reply@feeddoctor.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}