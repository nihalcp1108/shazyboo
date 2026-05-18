import express from 'express';
import {
    registerValidator,
    loginValidator,
    verifyOTPValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    verifyResetOTPValidator
} from '../utils/validator.js';
import {
    register,
    verifyOTP,
    resendOTP,
    login,
    getMe,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    verifyResetOTP,
    logout,
    addAddress,
    updateAddress,
    deleteAddress,
    getAddresses,
    checkOTPStatus,
    testEmailService
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidator, register);
router.post('/verify-otp', verifyOTPValidator, verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginValidator, login);
router.post('/forgotpassword', forgotPasswordValidator, forgotPassword);
router.post('/verify-reset-otp', verifyResetOTPValidator, verifyResetOTP);
router.put('/resetpassword/:resettoken', resetPasswordValidator, resetPassword);
router.get('/otp-status/:email', checkOTPStatus);
router.post('/test-email', testEmailService);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);
router.get('/logout', logout);

// Address routes
router.route('/address')
    .get(getAddresses)
    .post(addAddress);

router.route('/address/:addressId')
    .put(updateAddress)
    .delete(deleteAddress);

export default router;