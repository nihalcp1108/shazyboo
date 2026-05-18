import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { FaHeart, FaMagic, FaLock, FaArrowLeft, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { GiCottonFlower } from 'react-icons/gi';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const onSubmit = async (data) => {
    console.log('Resetting password with token:', token);
    setLoading(true);
    try {
      const result = await resetPassword(token, data.password, data.confirmPassword);
      console.log('Reset password result:', result);
      
      if (result.success) {
        setResetSuccess(true);
        toast.success('Password reset successful!');
        setTimeout(() => {
          // Check if user is admin
          if (result.user?.role === 'admin' || result.user?.email === 'shazyboo.info@gmail.com') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors) => {
    console.log('Form errors:', errors);
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FaShieldAlt className="text-white text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successful! 🎉</h2>
            <p className="text-gray-600">Redirecting you to the homepage...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center py-12 px-4">
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-32 left-32 w-20 h-20 rounded-full bg-pink-200/20 animate-pulse"></div>
        <div className="absolute bottom-40 right-40 w-24 h-24 rounded-full bg-purple-200/20 animate-pulse delay-300"></div>
        <FaMagic className="absolute top-1/2 right-1/3 text-blue-300/30 text-4xl animate-spin" style={{animationDuration: '20s'}} />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                <FaShieldAlt className="text-white text-4xl animate-pulse" />
              </div>
              <div className="absolute -top-3 -right-3">
                <FaMagic className="text-yellow-400 text-xl animate-spin" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Set New Password 🔐
          </h1>
          <p className="text-lg text-gray-600">
            Create a strong password for your account 🎀
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaLock className="mr-2 text-green-500" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password', {
                    required: 'Password is required 🔒',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters ✨'
                    }
                  })}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                  placeholder="Enter new password"
                  disabled={loading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <FaLock className="text-green-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                  <span className="mr-1">💝</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaLock className="mr-2 text-green-500" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <FaLock className="text-green-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                  <span className="mr-1">💝</span> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  <span className="animate-pulse">Resetting password... ✨</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">Reset Password</span>
                  <GiCottonFlower className="group-hover:animate-pulse" />
                </div>
              )}
            </button>
            
            <div className="text-center pt-6 border-t border-pink-100">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium transition-colors duration-300"
              >
                <FaArrowLeft className="mr-2" />
                Back to Login
              </button>
            </div>
          </form>
        </div>

        {/* Password Tips */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-pink-100">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
            <FaShieldAlt className="mr-2 text-green-500" />
            Password Tips:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use at least 6 characters</li>
            <li>• Mix uppercase and lowercase letters</li>
            <li>• Include numbers and special characters</li>
            <li>• Avoid using common words or personal info</li>
          </ul>
        </div>

        {/* Cute Footer Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <FaHeart className="text-pink-400 mr-2 animate-pulse" />
            Your security is our top priority! 🎀
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;