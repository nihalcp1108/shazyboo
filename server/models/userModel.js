import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your name'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters']
        },

        email: {
            type: String,
            required: [true, 'Please enter your email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },

        password: {
            type: String,
            required: [true, 'Please enter a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false
        },

        phone: {
            type: String,
            required: [true, 'Please enter your phone number'],
            match: [
                /^[0-9]{10}$/,
                'Please enter a valid 10-digit phone number'
            ]
        },

        avatar: {
            public_id: String,
            url: String
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        isBlocked: {
            type: Boolean,
            default: false
        },

        otp: String,

        otpExpire: Date,

        resetPasswordToken: String,

        resetPasswordExpire: Date,

        addresses: [
            {
                name: String,
                phone: String,
                address: String,
                city: String,
                state: String,
                country: String,
                zipCode: String,

                isDefault: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        ],

        orders: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order'
            }
        ],

        lastLogin: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// ============================================
// HASH PASSWORD
// ============================================

userSchema.pre('save', async function (next) {

    // ONLY HASH IF PASSWORD MODIFIED
    if (!this.isModified('password')) {
        return next();
    }

    try {

        const salt = await bcrypt.genSalt(10);

        this.password = await bcrypt.hash(
            this.password,
            salt
        );

        next();

    } catch (error) {

        next(error);

    }

});

// ============================================
// GENERATE JWT TOKEN
// ============================================

userSchema.methods.getSignedJwtToken = function () {

    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        }
    );

};

// ============================================
// MATCH PASSWORD
// ============================================

userSchema.methods.matchPassword = async function (enteredPassword) {

    return await bcrypt.compare(
        enteredPassword,
        this.password
    );

};

// ============================================
// GENERATE RESET PASSWORD TOKEN
// ============================================

userSchema.methods.getResetPasswordToken = function () {

    const resetToken = crypto
        .randomBytes(20)
        .toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire =
        Date.now() + 10 * 60 * 1000;

    return resetToken;

};

// ============================================
// GENERATE OTP
// ============================================

userSchema.methods.generateOTP = function () {

    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    this.otp = otp;

    this.otpExpire =
        Date.now() + 10 * 60 * 1000;

    return otp;

};

// ============================================
// REMOVE SENSITIVE DATA
// ============================================

userSchema.methods.toJSON = function () {

    const user = this.toObject();

    delete user.password;
    delete user.otp;
    delete user.resetPasswordToken;

    return user;

};

// ============================================
// MODEL
// ============================================

const User = mongoose.model(
    'User',
    userSchema
);

export default User;