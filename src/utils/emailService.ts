/**
 * EmailService — Real Email Dispatch via EmailJS
 *
 * HOW IT WORKS:
 * ─────────────────────────────────────────────────────────────────
 * This is a static GitHub Pages app (no backend server).
 * EmailJS lets you send real emails directly from the browser
 * by connecting to your own Gmail / Outlook / SendGrid account.
 *
 * SETUP STEPS (one-time, 5 minutes):
 * ─────────────────────────────────────────────────────────────────
 * 1. Go to https://www.emailjs.com and create a FREE account
 * 2. Add an Email Service (Gmail / Outlook / SendGrid / custom SMTP)
 *    → Copy your SERVICE ID (e.g. "service_abc123")
 * 3. Create an Email Template with these variables:
 *       {{to_email}}  {{from_name}}  {{subject}}  {{message}}
 *       {{reply_to}}  {{cc}}
 *    → Copy your TEMPLATE ID (e.g. "template_xyz789")
 * 4. Go to Account → API Keys
 *    → Copy your PUBLIC KEY (e.g. "user_XXXXXXXXXXXX")
 * 5. Paste all three into the Integrations Hub →
 *    Email Settings → EmailJS Configuration tab
 *    OR set them below as defaults:
 */

import emailjs from '@emailjs/browser';
import { StorageService } from './storage';

export interface EmailPayload {
  toEmail: string;
  toName: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  cc?: string;
  subject: string;
  message: string;
  attachmentName?: string;
  trackingPixelId?: string;
}

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export interface EmailSendResult {
  success: boolean;
  message: string;
  status?: number;
  text?: string;
}

/**
 * Load EmailJS config from Integration Hub storage.
 * Falls back to empty strings if not configured yet.
 */
export function getEmailJSConfig(userId?: string): EmailJSConfig {
  const stored = StorageService.getIntegrations(userId);
  const emailCfg = stored?.email?.fields || {};
  return {
    serviceId: emailCfg.emailjsServiceId || '',
    templateId: emailCfg.emailjsTemplateId || '',
    publicKey: emailCfg.emailjsPublicKey || '',
  };
}

/**
 * Send a real email via EmailJS.
 * Returns { success: true } on delivery, { success: false, message } on error.
 */
export async function sendRealEmail(
  payload: EmailPayload,
  config: EmailJSConfig
): Promise<EmailSendResult> {
  const { serviceId, templateId, publicKey } = config;

  if (!serviceId || !templateId || !publicKey) {
    return {
      success: false,
      message:
        'EmailJS is not configured. Please go to Integrations Hub → Email Settings → EmailJS tab and enter your Service ID, Template ID, and Public Key.',
    };
  }

  try {
    emailjs.init(publicKey);

    const templateParams = {
      to_email: payload.toEmail,
      to_name: payload.toName || payload.toEmail,
      from_name: payload.fromName || 'QuoteFlow ERP',
      from_email: payload.fromEmail || 'noreply@quoteflow.app',
      reply_to: payload.replyTo || payload.fromEmail || '',
      cc: payload.cc || '',
      subject: payload.subject,
      message: payload.message,
      attachment_name: payload.attachmentName || '',
      tracking_pixel_id: payload.trackingPixelId || '',
      sent_at: new Date().toLocaleString('en-IN'),
    };

    const response = await emailjs.send(serviceId, templateId, templateParams);

    return {
      success: true,
      message: `✅ Email delivered successfully!\nStatus: ${response.status} ${response.text}\nTo: ${payload.toEmail}\nSubject: ${payload.subject}`,
      status: response.status,
      text: response.text,
    };
  } catch (error: any) {
    const errMsg = error?.text || error?.message || String(error);
    return {
      success: false,
      message: `❌ Email delivery failed.\nError: ${errMsg}\n\nCheck your EmailJS credentials in Integrations Hub → Email Settings.`,
    };
  }
}
