// server/utils/resendService.js
// Resend email service wrapper using the Resend SDK.
// This module provides a simple `send` function that the rest of the
// application can call to dispatch transactional emails.
//
// Usage:
//   import { send as resendSend } from './resendService.js';
//   await resendSend({ to, subject, html });

import { Resend } from 'resend';

// Initialise Resend with the API key from environment variables.
// If the key is missing, we still create the client – the caller should
// handle the missing configuration (the sendEmail wrapper already does).
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email via Resend.
 *
 * @param {Object} params
 * @param {string} params.to      Recipient email address.
 * @param {string} params.subject Subject line of the email.
 * @param {string} params.html    HTML body of the email.
 * @returns {Promise<Object>} The result from Resend SDK.
 */
export const send = async ({ to, subject, html }) => {
  // Resend requires a `from` address. Prefer the configurable FROM_EMAIL.
  const from = process.env.FROM_EMAIL || 'no-reply@shazyboo.com';

  // The SDK method returns a promise that resolves to the HTTP response.
  // We simply forward that result to the caller.
  return await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
};

// Export the client for advanced usage if needed.
export default resend;
