import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHeart, FaMagic, FaEnvelope, FaArrowRight, FaClock, FaShieldAlt } from 'react-icons/fa';
import { GiCottonFlower } from 'react-icons/gi';
import { toast } from 'react-hot-toast';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  const { verifyOTP, resendOTP, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail');
  const from = location.state?.from || 'register';

  useEffect(() => {
    if (!email) {
      toast.error('No email found for verification');
      navigate('/register');
      return;
    }
  }, [email, navigate]);

  // Timer for resend OTP
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    
    setLoading(true);
    const result = await verifyOTP(email, otpCode);
    setLoading(false);
    
    if (result.success) {
      toast.success('Email verified successfully!');
      // Redirect based on user role
      if (result.user?.role === 'admin' || result.user?.email === 'shazyboo.info@gmail.com') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    const result = await resendOTP(email);
    setResendLoading(false);
    
    if (result.success) {
      setTimeLeft(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      // Focus on first input
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
      toast.success('New OTP sent to your email!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center py-12 px-4">
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-20 w-24 h-24 rounded-full bg-pink-200/20 animate-pulse"></div>
        <div className="absolute bottom-40 right-32 w-32 h-32 rounded-full bg-purple-200/20 animate-pulse delay-300"></div>
        <GiCottonFlower className="absolute top-1/4 right-1/4 text-pink-300/30 text-5xl animate-spin" style={{animationDuration: '20s'}} />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <FaShieldAlt className="text-white text-4xl animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2">
                <FaMagic className="text-yellow-400 text-xl animate-spin" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Verify Your Email! ✨
          </h1>
          <p className="text-lg text-gray-600">
            We've sent a verification code to
          </p>
          <p className="text-md font-semibold text-pink-600 mt-1 break-all">
            {email}
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* OTP Input Fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center justify-center">
                  <FaEnvelope className="mr-2 text-pink-500" />
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold bg-pink-50 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full">
                  <FaClock className="text-pink-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {canResend ? 'Code expired' : `Resend available in ${formatTime(timeLeft)}`}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  <span className="animate-pulse">Verifying... ✨</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">Verify Email</span>
                  <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              )}
            </button>
            
            <div className="text-center">
              <p className="text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend || resendLoading}
                  className={`font-bold transition-colors duration-300 ${
                    canResend && !resendLoading
                      ? 'text-pink-600 hover:text-pink-700 hover:underline'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {resendLoading ? (
                    <span className="inline-flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600 mr-2"></div>
                      Sending...
                    </span>
                  ) : (
                    'Resend OTP'
                  )}
                </button>
              </p>
            </div>

            {/* Help Note */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 text-center">
                <span className="font-bold">💡 Tip:</span> 
                Check your spam folder if you don't see the email in your inbox.
              </p>
            </div>
          </form>
        </div>

        {/* Cute Footer Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <FaHeart className="text-pink-400 mr-2 animate-pulse" />
            One step away from cuteness overload! 🎀
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;