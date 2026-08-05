// emailService.js - ES Module version
import nodemailer from "nodemailer";

// Email templates for ShazyBoo
export const emailTemplates = {
  // OTP Email (Simplified for testing)
  sendOTP: (otp, appName = 'ShazyBoo') => {
    console.log(`📧 OTP generated for ${appName}: ${otp}`);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - ${appName}</title>
        <style>
            body { font-family: Arial, sans-serif; background: #fce7f3; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .logo { color: #ec4899; font-size: 32px; font-weight: bold; margin-bottom: 20px; }
            .otp-box { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; font-size: 48px; font-weight: bold; padding: 20px; border-radius: 15px; margin: 30px 0; letter-spacing: 10px; }
            .note { background: #fef3c7; padding: 15px; border-radius: 10px; margin: 20px 0; color: #92400e; }
            .footer { margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">✨ ${appName} ✨</div>
            <h1>Email Verification</h1>
            <p>Hello Cutie! 👋 Welcome to the most adorable shopping experience!</p>

            <div class="otp-box">${otp}</div>

            <p>Enter this 6-digit code to verify your email address.</p>

            <div class="note">
                <strong>⏰ Valid for 10 minutes</strong><br>
                <strong>🔒 Never share this code with anyone</strong>
            </div>

            <p>Having trouble? Reply to this email or contact our support team.</p>

            <div class="footer">
                💝 Made with love by ${appName}<br>
                📧 Need help? Contact: support@shazyboo.com
            </div>
        </div>
    </body>
    </html>
    `;
  },

  // Welcome Email
  welcomeEmail: (userName) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ShazyBoo!</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f0f9ff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; text-align: center; }
            .welcome { color: #10b981; font-size: 28px; font-weight: bold; }
            .discount { background: #fef3c7; padding: 20px; border-radius: 15px; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; color: #dc2626; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="welcome">🎉 Welcome to ${userName}! 🎉</h1>
            <p>We're thrilled to have you in our cute community!</p>

            <div class="discount">
                <h2>🎁 Your Welcome Gift!</h2>
                <div class="code">WELCOME10</div>
                <p>Get 10% off on your first purchase! 🛍️</p>
            </div>

            <p>Start exploring our adorable collection now!</p>
            <p>Need help? Contact: support@shazyboo.com</p>
        </div>
    </body>
    </html>
  `,

  // Password Reset Email
  passwordReset: (resetUrl, appName = 'ShazyBoo') => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - ${appName}</title>
    </head>
    <body>
        <div style="text-align: center; padding: 40px;">
            <h1>🔐 Password Reset Request</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; display: inline-block; margin: 20px;">
                Reset Password
            </a>
            <p>This link expires in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
    </body>
    </html>
  `,

  // Password Reset Success
  passwordResetSuccess: (userName) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
    </head>
    <body>
        <div style="text-align: center; padding: 40px;">
            <h1 style="color: #10b981;">✅ Password Reset Successful!</h1>
            <p>Hello ${userName},</p>
            <p>Your password has been successfully reset.</p>
            <p>You can now login with your new password.</p>
        </div>
    </body>
    </html>
  `,

  // Password Reset OTP
  passwordResetOTP: (otp, appName = 'ShazyBoo') => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP - ${appName}</title>
        <style>
            body { font-family: Arial, sans-serif; background: #fce7f3; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .logo { color: #ec4899; font-size: 32px; font-weight: bold; margin-bottom: 20px; }
            .otp-box { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; font-size: 48px; font-weight: bold; padding: 20px; border-radius: 15px; margin: 30px 0; letter-spacing: 10px; }
            .note { background: #fef3c7; padding: 15px; border-radius: 10px; margin: 20px 0; color: #92400e; }
            .footer { margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🔐 ${appName} 🔐</div>
            <h1>Password Reset OTP</h1>
            <p>Hello! 👋 You requested a password reset for your account.</p>

            <div class="otp-box">${otp}</div>

            <p>Enter this 6-digit code on the verification page to reset your password.</p>

            <div class="note">
                <strong>⏰ Valid for 10 minutes</strong><br>
                <strong>🔒 If you didn't request this, please ignore this email.</strong>
            </div>

            <div class="footer">
                💝 Made with love by ${appName}<br>
                📧 Need help? Contact: support@shazyboo.com
            </div>
        </div>
    </body>
    </html>
  `,

  // Password Change Notification
  passwordChangeNotification: (userName) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
    </head>
    <body>
        <div style="text-align: center; padding: 40px;">
            <h1>🔐 Password Changed</h1>
            <p>Hello ${userName},</p>
            <p>Your password was recently changed.</p>
            <p>If you didn't make this change, contact support immediately.</p>
        </div>
    </body>
    </html>
  `,

  // Order Confirmation Email
  orderConfirmation: (order) => {
    const itemsList = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(0)}</td>
      </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #ec4899; border-radius: 10px; overflow: hidden; }
            .header { background: #ec4899; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .total { font-weight: bold; font-size: 1.2em; color: #ec4899; }
            .footer { padding: 20px; text-align: center; background: #fdf2f8; font-size: 0.8em; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmed! 🎉</h1>
            </div>
            <div class="content">
                <p>Hello cutie! ✨ Your order <strong>${order.orderId}</strong> has been received and is being processed.</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #fdf2f8;">
                            <th style="padding: 10px; text-align: left;">Item</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsList}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style="padding: 10px; font-weight: bold;">Total</td>
                            <td style="padding: 10px; text-align: right;" class="total">₹${order.priceSummary.totalPrice.toFixed(0)}</td>
                        </tr>
                    </tfoot>
                </table>
                <p>Shipping to: ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
                <p>We'll notify you once your order is on its way! 🚚</p>
            </div>
            <div class="footer">
                <p>Thank you for shopping with ShazyBoo! 💖</p>
            </div>
        </div>
    </body>
    </html>
    `;
  },

  // Order Status Update Email
  orderStatusUpdate: (order, status) => {
    const statusMessages = {
      confirmed: 'Your order has been confirmed! ✨',
      processing: 'Your order is now being processed! 📦',
      shipped: 'Yay! Your order has been shipped! 🚚',
      delivered: 'Your order has been delivered! Enjoy! 🎁',
      cancelled: 'Your order has been cancelled.',
      refunded: 'A refund has been processed for your order.'
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #ec4899; border-radius: 10px; overflow: hidden; }
            .header { background: #ec4899; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; text-align: center; }
            .status-badge { display: inline-block; padding: 10px 20px; background: #fdf2f8; color: #ec4899; border-radius: 20px; font-weight: bold; margin: 20px 0; border: 1px solid #ec4899; }
            .footer { padding: 20px; text-align: center; background: #fdf2f8; font-size: 0.8em; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Update! ✨</h1>
            </div>
            <div class="content">
                <p>Hello! We have an update for your order <strong>${order.orderId}</strong></p>
                <div class="status-badge">${status.toUpperCase()}</div>
                <p>${statusMessages[status] || 'Your order status has changed.'}</p>
                <p>Check your order details on our website.</p>
            </div>
            <div class="footer">
                <p>Thank you for choosing ShazyBoo! 💖</p>
            </div>
        </div>
    </body>
    </html>
    `;
  },

  // Contact Form Submission Email
  contactMessage: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Message - ShazyBoo</title>
        <style>
            body { font-family: Arial, sans-serif; background: #fce7f3; padding: 20px; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #ec4899; font-size: 32px; font-weight: bold; }
            .info-grid { display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .message-box { background: #fdf2f8; padding: 20px; border-radius: 15px; border-left: 5px solid #ec4899; line-height: 1.6; }
            .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">✨ ShazyBoo ✨</div>
                <h1>New Message Received! 💌</h1>
            </div>

            <div class="info-grid">
                <div class="label">Name:</div>
                <div class="value">${data.firstName} ${data.lastName}</div>

                <div class="label">Email:</div>
                <div class="value">${data.email}</div>

                <div class="label">Phone:</div>
                <div class="value">${data.phone || 'Not provided'}</div>

                <div class="label">Subject:</div>
                <div class="value">${data.subject}</div>

                <div class="label">Date:</div>
                <div class="value">${new Date().toLocaleString()}</div>
            </div>

            <h3 style="color: #ec4899;">Message Body:</h3>
            <div class="message-box">
                ${data.message.replace(/\n/g, '<br>')}
            </div>

            <div class="footer">
                💝 This message was sent via the ShazyBoo contact form.<br>
                Please reply directly to ${data.email} to contact the user.
            </div>
        </div>
    </body>
    </html>
  `,

  // Admin Order Notification
  adminOrderNotification: (order) => {
    const itemsList = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.name} ${item.selectedColor ? `(${item.selectedColor})` : ''} x ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(0)}</td>
      </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; color: #333; background: #fdf2f8; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border: 2px solid #ec4899; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .header { background: #ec4899; color: white; padding: 25px; text-align: center; }
            .content { padding: 30px; }
            .section-title { font-weight: bold; color: #ec4899; border-bottom: 1px solid #fce7f3; padding-bottom: 10px; margin-top: 25px; margin-bottom: 15px; }
            .total { font-weight: bold; font-size: 1.3em; color: #ec4899; }
            .footer { padding: 20px; text-align: center; background: #fdf2f8; font-size: 0.8em; color: #666; }
            .btn { display: inline-block; background: #ec4899; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛍️ New Order Received!</h1>
                <p>Order ID: ${order.orderId}</p>
            </div>
            <div class="content">
                <p>Hey Admin! 🎀 A new order just arrived on ShazyBoo. Here are the details:</p>

                <div class="section-title">👤 Customer Details</div>
                <p><strong>Name:</strong> ${order.shippingAddress.fullName}</p>
                <p><strong>Email:</strong> ${order.shippingAddress.email}</p>
                <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>

                <div class="section-title">📦 Order Items</div>
                <table style="width: 100%; border-collapse: collapse;">
                    ${itemsList}
                    <tr>
                        <td style="padding: 15px 10px; font-weight: bold;">Grand Total</td>
                        <td style="padding: 15px 10px; text-align: right;" class="total">₹${order.priceSummary.totalPrice.toFixed(0)}</td>
                    </tr>
                </table>

                <div class="section-title">📍 Shipping Address</div>
                <p>${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</p>

                <div style="text-align: center;">
                    <a href="${process.env.ADMIN_URL || 'https://shazyboo.com/admin'}" class="btn">View in Admin Dashboard</a>
                </div>
            </div>
            <div class="footer">
                <p>ShazyBoo Store Notification • ${new Date().toLocaleString()}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  },

  // Login Notification Email
  loginNotification: (userName, loginTime) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Successful Login - ShazyBoo</title>
        <style>
            body { font-family: Arial, sans-serif; background: #fdf2f8; padding: 20px; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; }
            .logo { color: #ec4899; font-size: 32px; font-weight: bold; margin-bottom: 20px; }
            .status-icon { font-size: 48px; margin: 20px 0; }
            .footer { margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">✨ ShazyBoo ✨</div>
            <div class="status-icon">🔓</div>
            <h1>New Login Detected</h1>
            <p>Hello ${userName}! 👋</p>
            <p>We detected a new login to your ShazyBoo account on <strong>${loginTime}</strong>.</p>
            <p>If this was you, no further action is needed! Happy shopping! 🛍️</p>
            <div class="footer">
                💝 Made with love by ShazyBoo<br>
                📧 Need help? Contact: support@shazyboo.com
            </div>
        </div>
    </body>
    </html>
  `
};

// Send email via Resend (fallback to console logging in dev)
// Initialize Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email via Gmail SMTP (fallback to console logging in dev)
export const sendEmail = async ({ email, subject, html }) => {
  console.log('\n📧📧📧 EMAIL SEND REQUEST 📧📧📧');
  console.log('To:', email);
  console.log('Subject:', subject);

  const otpMatch = html.match(/\d{6}/);
  if (otpMatch) console.log('🔢 OTP for testing:', otpMatch[0]);
  console.log('HTML Preview:', html.substring(0, 200).trim().replace(/\s+/g, ' ') + '...');

  // If Gmail credentials not set, fallback to logging
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set – email logged only (dev fallback)');
    return { success: true, message: 'Email logged (SMTP not configured)', ...(otpMatch && { otp: otpMatch[0] }) };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html
    });
    console.log('✅ Email sent via Gmail. Message ID:', info.messageId);
    return { success: true, message: 'Email sent via Gmail', info, ...(otpMatch && { otp: otpMatch[0] }) };
  } catch (err) {
    console.error('❌ Email send error (Gmail):', err.message);
    throw err;
  }
};


// Test email utility using the same flow
export const testEmail = async (toEmail = null) => {
  try {
    const testEmailAddress = toEmail || process.env.TEST_EMAIL || 'test@example.com';
    const result = await sendEmail({
      email: testEmailAddress,
      subject: '🧪 ShazyBoo Email Test',
      html: emailTemplates.sendOTP('123456')
    });
    console.log('✅ Test email sent successfully to:', testEmailAddress);
    return result;
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    throw error;
  }
};

// Also export as default for convenience
export default {
  emailTemplates,
  sendEmail,
  testEmail
};