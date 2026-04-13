import { env } from "../env/index.js";
import { logger } from "../logger/index.js";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  if (!env.SENDGRID_API_KEY) {
    logger.warn(`Email not sent (no SENDGRID_API_KEY): to=${to} subject="${subject}"`);
    logger.info(`Email content:\n${html}`);
    return;
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: env.SENDGRID_FROM_EMAIL },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.error(`SendGrid error: ${response.status} ${body}`);
    throw new Error(`Failed to send email: ${response.status}`);
  }

  logger.info(`Email sent to ${to}: "${subject}"`);
}
