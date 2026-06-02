import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import crypto from 'crypto';
import { sendEmail, emailTemplates } from '../utils/emailService.js';
import User from '../models/userModel.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    let { name, email, password, phone } = req.body;

    // CHECK DATA
    if (!name || !email || !password || !phone) {
        return res.status(400).json({
            success: false,
            error: 'Please provide all required fields'
        });
    }

    email = email.toLowerCase().trim();

    console.log('📝 Register request:', email);

    // CHECK EXISTING USER
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            error: 'User already exists'
        });
    }

    // ADMIN CHECK
    let role = 'user';
    let isVerified = false;

    if (
        email === 'shazyboo.info@gmail.com' ||
        email === 'shazybooinfo@gmail.com'
    ) {
        role = 'admin';
        isVerified = true;
    }

    // CREATE USER
    const user = await User.create({
        name,
        email,
        password,
        phone,
        role,
        isVerified
    });

    console.log('✅ User created');

    let otp = null;

    // GENERATE OTP
    if (!isVerified) {
        otp = user.generateOTP();
        await user.save({ validateBeforeSave: false });
        console.log('📩 OTP Generated:', otp);
    }

    // GENERATE TOKEN
    const token = user.getSignedJwtToken();
    let emailWarning = null;

    if (!isVerified && otp) {
        try {
            console.log('📧 Sending OTP email...');
            const emailResult = await sendEmail({
                email: user.email,
                subject: '✨ ShazyBoo - Email Verification OTP',
                html: emailTemplates.sendOTP(otp, 'ShazyBoo')
            });
            console.log('✅ OTP email sent', emailResult);

            if (emailResult?.previewUrl) {
                emailWarning = 'Verification email was sent via Ethereal test SMTP. Check server logs for the preview URL.';
            }
        } catch (error) {
            console.error('❌ OTP email send failed:', error.message);

            // Default to true if email failed, unless explicitly set to false
            const debugOtpEnabled = process.env.EMAIL_DEBUG_OTP?.toLowerCase() !== 'false';
            const responsePayload = {
                success: true,
                message: 'Registration completed, but verification email could not be sent.',
                warning: `Verification email failed (SMTP ports are likely blocked in production): ${error.message}. Please use the fallback Debug OTP below to verify your account!`,
                token,
                needsVerification: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified
                }
            };

            if (debugOtpEnabled && otp) {
                responsePayload.debugOtp = otp;
            }

            return res.status(201).json(responsePayload);
        }
    }

    const responsePayload = {
        success: true,
        message: isVerified
            ? 'Admin registration successful'
            : 'Registration successful. OTP will arrive shortly.',
        token,
        needsVerification: !isVerified,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        }
    };

    if (emailWarning) {
        responsePayload.warning = emailWarning;
    }

    res.status(201).json(responsePayload);
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    console.log(`🔍 OTP verification attempt for: ${email}, OTP: ${otp}`);

    // Validate required fields
    if (!email || !otp) {
        throw new ErrorResponse('Please provide email and OTP', 400);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        throw new ErrorResponse('User not found with this email', 404);
    }

    // Check if already verified
    if (user.isVerified) {
        // If already verified, just send token
        const token = user.getSignedJwtToken();
        return res.json({
            success: true,
            message: 'Email already verified',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    }

    // Check OTP
    if (!user.otp || user.otp !== otp) {
        console.log(`❌ OTP mismatch. Stored: ${user.otp}, Received: ${otp}`);
        throw new ErrorResponse('Invalid OTP code', 400);
    }

    // Check OTP expiry
    if (user.otpExpire < Date.now()) {
        console.log(`⏰ OTP expired at: ${new Date(user.otpExpire).toLocaleString()}`);
        throw new ErrorResponse('OTP has expired. Please request a new one.', 400);
    }

    console.log(`✅ OTP verified for: ${email}`);

    // Mark as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    // Send welcome email
    try {
        await sendEmail({
            email: user.email,
            subject: '🎉 Welcome to ShazyBoo!',
            html: emailTemplates.welcomeEmail(user.name)
        });
    } catch (emailError) {
        console.error('Welcome email failed:', emailError);
        // Don't fail the verification if welcome email fails
    }

    res.json({
        success: true,
        message: 'Email verified successfully! Welcome to ShazyBoo!',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified
        }
    });
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = asyncHandler(async (req, res) => {
    let email = req.body.email;
    email = email?.toLowerCase().trim();

    console.log(`🔄 Resend OTP request for: ${email}`);

    // Validate email
    if (!email) {
        throw new ErrorResponse('Please provide email', 400);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        throw new ErrorResponse('User not found with this email', 404);
    }

    // Check if already verified
    if (user.isVerified) {
        throw new ErrorResponse('Email already verified', 400);
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    console.log(`📧 Resending OTP to ${email}: ${otp}`);

    // Send verification email
    try {
        const emailResult = await sendEmail({
            email: user.email,
            subject: '✨ ShazyBoo - New Verification OTP',
            html: emailTemplates.sendOTP(otp, user.name || 'ShazyBoo User')
        });
        console.log('📧 Resend email result:', emailResult);

        res.json({
            success: true,
            message: 'New OTP sent to your email'
        });
        return;
    } catch (emailError) {
        console.error('Failed to resend OTP email:', emailError.message);
        // Default to true if email failed, unless explicitly set to false
        const debugOtpEnabled = process.env.EMAIL_DEBUG_OTP?.toLowerCase() !== 'false';

        if (debugOtpEnabled) {
            res.json({
                success: true,
                message: `Failed to send OTP email: ${emailError.message}. Using debug OTP instead.`,
                warning: `Email delivery failed (SMTP ports are likely blocked in production): ${emailError.message}. Use the code below to verify your account.`,
                debugOtp: otp
            });
            return;
        }

        throw new ErrorResponse(`Failed to send OTP email. ${emailError.message}`, 500);
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    console.log(`🔑 Login attempt for: ${email}`);

    // Validate email & password
    if (!email || !password) {
        throw new ErrorResponse('Please provide email and password', 400);
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ErrorResponse('Invalid credentials', 401);
    }
    console.log(`User found in DB: ${user.email}`);

    // Check if user is blocked
    if (user.isBlocked) {
        throw new ErrorResponse('Your account has been blocked. Please contact support.', 403);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        throw new ErrorResponse('Invalid credentials', 401);
    }

    // Check if user is verified or is admin
    const isAdminEmail = email === 'shazyboo.info@gmail.com';

    // If email not verified, we used to require OTP verification and return 401.
// For development convenience we now allow login even if the user hasn't verified their email.
// The admin user is still auto‑verified below.
// Removed the block that sent an OTP and returned a 401 response.
// This change lets normal users obtain a JWT token immediately after successful password check.
// Note: In production you may want to reinstate the verification flow.


    // Auto-verify admin user if not already verified
    if (isAdminEmail && !user.isVerified) {
        console.log('👑 Auto-verifying admin user');
        user.isVerified = true;
        user.role = 'admin';
        await user.save();
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    console.log(`✅ Login successful for: ${email}, Role: ${user.role}`);

    // Send login notification email in background
    setImmediate(async () => {
        try {
            const loginTime = new Date().toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'short'
            });
            await sendEmail({
                email: user.email,
                subject: '🔓 ShazyBoo - Successful Login Notification',
                html: emailTemplates.loginNotification(user.name || 'ShazyBoo User', loginTime)
            });
            console.log('📧 Login notification email sent');
        } catch (emailError) {
            console.error('Login notification email failed:', emailError);
        }
    });

    res.json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
            avatar: user.avatar,
            createdAt: user.createdAt
        }
    });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
        .select('-password')
        .populate('wishlist', 'name price images')
        .populate('addresses');

    if (!user) {
        throw new ErrorResponse('User not found', 404);
    }

    res.json({
        success: true,
        user
    });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key =>
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    // If email is being changed, check if new email already exists
    if (fieldsToUpdate.email && fieldsToUpdate.email !== req.user.email) {
        const existingUser = await User.findOne({ email: fieldsToUpdate.email });
        if (existingUser) {
            throw new ErrorResponse('Email already in use', 400);
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        fieldsToUpdate,
        {
            new: true,
            runValidators: true
        }
    ).select('-password');

    res.json({
        success: true,
        user
    });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
        throw new ErrorResponse('Please provide current and new password', 400);
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
        throw new ErrorResponse('New password must be different from current password', 400);
    }

    // Check password length
    if (newPassword.length < 6) {
        throw new ErrorResponse('Password must be at least 6 characters', 400);
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        throw new ErrorResponse('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = user.getSignedJwtToken();

    // Send password change notification email
    try {
        await sendEmail({
            email: user.email,
            subject: '🔐 ShazyBoo - Password Changed',
            html: emailTemplates.passwordChangeNotification(user.name)
        });
    } catch (emailError) {
        console.error('Password change notification email failed:', emailError);
        // Don't fail the request if email fails
    }

    res.json({
        success: true,
        token,
        message: 'Password updated successfully'
    });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    let { email } = req.body;
    email = email.toLowerCase().trim();

    console.log(`🔐 Forgot password request for: ${email}`);

    // Validate email
    if (!email) {
        throw new ErrorResponse('Please provide email', 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
        // Don't reveal if user exists for security
        return res.json({
            success: true,
            message: 'If a user exists with this email, password reset instructions will be sent'
        });
    }

    // Generate OTP
    const otp = user.generateOTP();
    // Also generate a reset token that will be "unlocked" by the OTP
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    console.log(`📧 Sending password reset OTP to ${email}: ${otp}`);

    // Send email
    try {
        await sendEmail({
            email: user.email,
            subject: '🔐 ShazyBoo - Password Reset OTP',
            html: emailTemplates.passwordResetOTP(otp, 'ShazyBoo')
        });

        res.json({
            success: true,
            message: 'Password reset OTP sent to your email',
            email: user.email // Send back email for the frontend to use
        });
    } catch (emailError) {
        console.error('Password reset email failed:', emailError);

        // Default to true if email failed, unless explicitly set to false
        const debugOtpEnabled = process.env.EMAIL_DEBUG_OTP?.toLowerCase() !== 'false';

        if (debugOtpEnabled) {
            res.json({
                success: true,
                message: `Failed to send password reset email: ${emailError.message}. Using fallback OTP.`,
                warning: `Email delivery failed (SMTP ports are likely blocked in production): ${emailError.message}. Use the code below to reset your password.`,
                email: user.email,
                debugOtp: otp
            });
            return;
        }

        // Reset fields if email fails
        user.otp = undefined;
        user.otpExpire = undefined;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ErrorResponse('Email could not be sent', 500);
    }
});

// @desc    Verify Password Reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOTP = asyncHandler(async (req, res) => {
    let { email, otp } = req.body;
    email = email.toLowerCase().trim();

    console.log(`🔍 Verify reset OTP for: ${email}, OTP: ${otp}`);

    if (!email || !otp) {
        throw new ErrorResponse('Please provide email and OTP', 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ErrorResponse('User not found', 404);
    }

    // Check OTP
    if (!user.otp || user.otp !== otp) {
        throw new ErrorResponse('Invalid OTP code', 400);
    }

    // Check OTP expiry
    if (user.otpExpire < Date.now()) {
        throw new ErrorResponse('OTP has expired', 400);
    }

    // If OTP is valid, return a temporary "unlocked" reset token
    // We can't return the hashed token from the DB, but we need the original plaintext token.
    // Wait, I can't get the plaintext token back from the hash.
    // I should generate a NEW reset token here and return it.

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    res.json({
        success: true,
        message: 'OTP verified successfully',
        resetToken: resetToken
    });
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;

    console.log(`🔐 Reset password attempt with token: ${req.params.resettoken}`);

    // Validate password
    if (!password) {
        throw new ErrorResponse('Please provide a new password', 400);
    }

    if (password.length < 6) {
        throw new ErrorResponse('Password must be at least 6 characters', 400);
    }

    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    console.log(`Looking for token hash: ${resetPasswordToken}`);

    const user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        // Check if token exists but expired
        const expiredUser = await User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: { $lte: Date.now() }
        });

        if (expiredUser) {
            throw new ErrorResponse('Reset token has expired. Please request a new password reset.', 400);
        }

        throw new ErrorResponse('Invalid or expired reset token', 400);
    }

    console.log(`✅ User found: ${user.email}, resetting password`);

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new token for automatic login
    const token = user.getSignedJwtToken();

    // Send password reset confirmation email
    try {
        await sendEmail({
            email: user.email,
            subject: '✅ ShazyBoo - Password Reset Successful',
            html: emailTemplates.passwordResetSuccess(user.name)
        });
    } catch (emailError) {
        console.error('Password reset confirmation email failed:', emailError);
        // Don't fail the reset if confirmation email fails
    }

    res.json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified
        },
        message: 'Password reset successful'
    });
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// @desc    Check OTP Status
// @route   GET /api/auth/otp-status/:email
// @access  Public
export const checkOTPStatus = asyncHandler(async (req, res) => {
    const { email } = req.params;

    const user = await User.findOne({ email }).select('otp otpExpire isVerified');

    if (!user) {
        throw new ErrorResponse('User not found', 404);
    }

    res.json({
        success: true,
        hasOTP: !!user.otp,
        isExpired: user.otpExpire ? user.otpExpire < Date.now() : true,
        isVerified: user.isVerified,
        expiresIn: user.otpExpire ? Math.max(0, user.otpExpire - Date.now()) / 1000 : 0
    });
});

// @desc    Test email service
// @route   POST /api/auth/test-email
// @access  Public
export const testEmailService = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ErrorResponse('Please provide email', 400);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`🧪 Test email to ${email} with OTP: ${otp}`);

    const result = await sendEmail({
        email: email,
        subject: '🧪 Test Email from ShazyBoo',
        html: emailTemplates.sendOTP(otp, 'Test User')
    });

    res.json({
        success: result.success,
        message: result.message || 'Test email sent',
        otp: otp,
        result: result
    });
});

// @desc    Add user address
// @route   POST /api/auth/address
// @access  Private
export const addAddress = asyncHandler(async (req, res) => {
    const { name, address, city, state, zipCode, country, phone, isDefault } = req.body;
    const userId = req.user.id;

    console.log(`📍 Add address request for user: ${userId}`);

    // Validate required fields
    if (!name || !address || !city || !state || !zipCode || !country || !phone) {
        throw new ErrorResponse('Please provide all required address fields', 400);
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
        throw new ErrorResponse('User not found', 404);
    }

    // Create address object
    const newAddress = {
        name,
        address,
        city,
        state,
        zipCode,
        country,
        phone,
        isDefault: isDefault || false
    };

    // If setting as default, update all other addresses to non-default
    if (isDefault) {
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });
    }

    // If this is the first address, set it as default
    if (user.addresses.length === 0) {
        newAddress.isDefault = true;
    }

    // Add address to user
    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
        success: true,
        message: 'Address added successfully',
        address: user.addresses[user.addresses.length - 1]
    });
});

// @desc    Get user addresses
// @route   GET /api/auth/address
// @access  Private
export const getAddresses = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('addresses');

    res.json({
        success: true,
        count: user.addresses.length,
        addresses: user.addresses
    });
});

// @desc    Update user address
// @route   PUT /api/auth/address/:addressId
// @access  Private
export const updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const { name, address, city, state, zipCode, country, phone, isDefault } = req.body;

    console.log(`✏️ Update address request: ${addressId}`);

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
        throw new ErrorResponse('User not found', 404);
    }

    // Find address index
    const addressIndex = user.addresses.findIndex(addr =>
        addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
        throw new ErrorResponse('Address not found', 404);
    }

    // Update address fields
    const addressToUpdate = user.addresses[addressIndex];

    if (name) addressToUpdate.name = name;
    if (address) addressToUpdate.address = address;
    if (city) addressToUpdate.city = city;
    if (state) addressToUpdate.state = state;
    if (zipCode) addressToUpdate.zipCode = zipCode;
    if (country) addressToUpdate.country = country;
    if (phone) addressToUpdate.phone = phone;

    // Handle default address change
    if (isDefault === true) {
        // Set all addresses to non-default first
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });
        // Then set the current one as default
        addressToUpdate.isDefault = true;
    } else if (isDefault === false) {
        addressToUpdate.isDefault = false;
    }

    await user.save();

    res.json({
        success: true,
        message: 'Address updated successfully',
        address: addressToUpdate
    });
});

// @desc    Delete user address
// @route   DELETE /api/auth/address/:addressId
// @access  Private
export const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    console.log(`🗑️ Delete address request: ${addressId}`);

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
        throw new ErrorResponse('User not found', 404);
    }

    // Find address
    const address = user.addresses.id(addressId);
    if (!address) {
        throw new ErrorResponse('Address not found', 404);
    }

    // Check if deleting default address
    const wasDefault = address.isDefault;

    // Remove address
    user.addresses.pull(addressId);
    await user.save();

    // If deleted address was default and there are other addresses, set first one as default
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
        await user.save();
    }

    res.json({
        success: true,
        message: 'Address deleted successfully',
        addressId
    });
});