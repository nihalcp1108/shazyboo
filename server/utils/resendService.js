import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
let resend = null;

try {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && apiKey !== 'your_resend_api_key_here') {
    resend = new Resend(apiKey);
    console.log('✅ Resend initialized successfully');
  } else {
    console.warn('⚠️ Resend API key not set or using default placeholder. Email sending will be disabled.');
    console.warn('   To enable emails, set RESEND_API_KEY in your .env file');
  }
} catch (error) {
  console.error('❌ Failed to initialize Resend:', error.message);
}

export const send = async ({ to, subject, html }) => {
  // Check if Resend is initialized
  if (!resend) {
    console.warn('⚠️ Resend not initialized. Email would be sent to:', to);
    console.warn('   Subject:', subject);
    console.warn('   HTML Preview:', html.substring(0, 100) + '...');
    
    // Return a mock success response for development
    return {
      data: {
        id: `mock-${Date.now()}`,
        message: 'Email would be sent in production (Resend not configured)'
      },
      error: null
    };
  }

  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error('Resend error:', error);
    throw error;
  }
};

// Also export as default for convenience
export default { send };