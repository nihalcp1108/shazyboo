import { sendEmail, emailTemplates } from '../utils/emailService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Send contact message
// @route   POST /api/contact
// @access  Public
export const sendContactMessage = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    if (!firstName || !lastName || !email || !subject || !message) {
        return next(new ErrorResponse('Please provide all required fields', 400));
    }

    try {
        // Send email to admin
        const adminEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
        
        await sendEmail({
            email: adminEmail,
            subject: `New Contact Message: ${subject} from ${firstName} ${lastName}`,
            html: emailTemplates.contactMessage({
                firstName,
                lastName,
                email,
                phone,
                subject,
                message
            })
        });

        res.status(200).json({
            success: true,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Contact email error:', error);
        return next(new ErrorResponse('Email could not be sent', 500));
    }
});
