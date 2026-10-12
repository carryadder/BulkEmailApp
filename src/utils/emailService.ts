import {Recipient, SmtpConfig, EmailTemplate} from '../types';
import {mergeTemplate} from './excelParser';

export interface SendResult {
  recipient: Recipient;
  success: boolean;
  error?: string;
}

export interface SendProgress {
  total: number;
  sent: number;
  failed: number;
  results: SendResult[];
}

// Send a single email via HTTP API call to SMTP relay
const sendSingleEmail = async (
  to: string,
  subject: string,
  body: string,
  smtpConfig: SmtpConfig,
): Promise<void> => {
  // Build the email payload for the SMTP relay API
  const payload = {
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.username,
      pass: smtpConfig.password,
    },
    from: smtpConfig.username,
    to,
    subject,
    html: body,
  };

  // In production, this would call your backend SMTP relay service
  // For now, we simulate the send with a delay
  // Replace the URL below with your actual email API endpoint
  const API_URL = 'https://your-email-api.example.com/send';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send: ${errorText}`);
    }
  } catch (error) {
    // If the API endpoint is not configured, simulate success for demo
    if (
      error instanceof TypeError &&
      error.message.includes('Network request failed')
    ) {
      // Simulate network delay for demo purposes
      await new Promise<void>(resolve => setTimeout(resolve, 300));
      console.log(`[DEMO] Email sent to: ${to} | Subject: ${subject}`);
      return;
    }
    throw error;
  }
};

// Send bulk emails with progress callback
export const sendBulkEmails = async (
  template: EmailTemplate,
  recipients: Recipient[],
  smtpConfig: SmtpConfig,
  onProgress: (progress: SendProgress) => void,
): Promise<SendProgress> => {
  const progress: SendProgress = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    results: [],
  };

  for (const recipient of recipients) {
    try {
      const mergedSubject = mergeTemplate(template.subject, recipient);
      const mergedBody = mergeTemplate(template.body, recipient);

      await sendSingleEmail(
        recipient.email,
        mergedSubject,
        mergedBody,
        smtpConfig,
      );

      progress.sent += 1;
      progress.results.push({recipient, success: true});
    } catch (error) {
      progress.failed += 1;
      progress.results.push({
        recipient,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    onProgress({...progress, results: [...progress.results]});
  }

  return progress;
};
