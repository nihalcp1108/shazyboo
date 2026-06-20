import { Resend } from 'resend';

let resend = null;

try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.error('❌ RESEND_API_KEY is missing');
    } else {
        resend = new Resend(apiKey);
        console.log('✅ Resend initialized successfully');
    }
} catch (error) {
    console.error('❌ Resend initialization error:', error);
}

export const send = async ({ to, subject, html }) => {
    if (!resend) {
        throw new Error('Resend is not initialized. Check RESEND_API_KEY.');
    }

    try {
        console.log('📧 Sending email via Resend...');
        console.log('To:', to);
        console.log('Subject:', subject);

        const response = await resend.emails.send({
            from: 'onboarding@resend.dev', // keep this for testing
            to,
            subject,
            html
        });

        console.log('✅ Resend Response:', JSON.stringify(response, null, 2));

        if (response.error) {
            console.error('❌ Resend API Error:', response.error);
            throw new Error(response.error.message || 'Unknown Resend error');
        }

        return response;
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        throw error;
    }
};

export default { send };