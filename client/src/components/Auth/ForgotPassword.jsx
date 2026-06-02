import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../Context/AuthContext'
import { FaHeart, FaMagic, FaEnvelope, FaArrowLeft, FaShieldAlt, FaCheckCircle, FaLock, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa'
import { GiCottonFlower } from 'react-icons/gi'

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [debugOtp, setDebugOtp] = useState(null)
  const { forgotPassword, verifyResetOTP, resetPassword } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  // Step 1: Request OTP
  const onEmailSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await forgotPassword(data.email)
      if (result.success) {
        setSubmittedEmail(data.email)
        setStep(2)
        if (result.debugOtp) {
          setDebugOtp(result.debugOtp)
        }
        toast.success('✨ OTP sent! Please check your email.')
      }
    } catch (error) {
      console.error('Email submit error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const onOtpSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await verifyResetOTP(submittedEmail, data.otp)
      if (result.success) {
        setResetToken(result.resetToken)
        setStep(3)
        toast.success('✅ OTP verified! Set your new password.')
      }
    } catch (error) {
      console.error('OTP verify error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const onPasswordReset = async (data) => {
    setLoading(true)
    try {
      const result = await resetPassword(resetToken, data.password, data.confirmPassword)
      if (result.success) {
        toast.success('🎊 Password reset successful!')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (error) {
      console.error('Password reset error:', error)
    } finally {
      setLoading(false)
    }
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
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                <FaShieldAlt className="text-white text-4xl animate-pulse" />
              </div>
              <div className="absolute -top-3 -right-3">
                <FaMagic className="text-yellow-400 text-xl animate-spin" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {step === 1 ? 'Forgot Password? 🔑' : step === 2 ? 'Verify OTP ✉️' : 'New Password 🔐'}
          </h1>
          <p className="text-lg text-gray-600">
            {step === 1 && 'Enter your email to receive a reset code 🎀'}
            {step === 2 && `Enter the 6-digit code sent to ${submittedEmail} ✨`}
            {step === 3 && 'Create a strong new password for your account 💖'}
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          
          {/* STEP 1: ENTER EMAIL */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaEnvelope className="mr-2 text-pink-500" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required 💌',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address ✉️'
                      }
                    })}
                    className="w-full px-4 py-3 pl-12 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaEnvelope className="text-pink-400" />
                  </div>
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                    <span className="mr-1">💝</span> {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Sending Magic... ✨' : 'Get Verification Code 🎀'}
              </button>
              
              <div className="text-center pt-6 border-t border-pink-100">
                <Link to="/login" className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium">
                  <FaArrowLeft className="mr-2" /> Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onOtpSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaKey className="mr-2 text-purple-500" />
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength="6"
                    {...register('otp', {
                      required: 'Please enter the 6-digit code 🔢',
                      pattern: { value: /^[0-9]{6}$/, message: 'OTP must be 6 digits 🔢' }
                    })}
                    className="w-full px-4 py-4 text-center text-3xl tracking-[1rem] font-bold bg-purple-50 border-2 border-purple-100 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 text-purple-700"
                    placeholder="000000"
                    disabled={loading}
                  />
                </div>
                {errors.otp && (
                  <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                    <span className="mr-1">💝</span> {errors.otp.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Verifying... 🔍' : 'Verify Code ✨'}
              </button>
              
              {/* Help Note */}
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 text-center">
                  <span className="font-bold">💡 Tip:</span> 
                  Check your spam folder if you don't see the email in your inbox.
                </p>
                {debugOtp && (
                  <p className="mt-3 text-sm text-pink-600 font-semibold text-center">
                    <span className="font-bold">Debug OTP:</span> {debugOtp}
                  </p>
                )}
              </div>

              <div className="text-center pt-6 border-t border-pink-100">
                <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-pink-600 transition-colors">
                  Didn't get the code? Try again
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleSubmit(onPasswordReset)} className="space-y-6">
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
                      minLength: { value: 6, message: 'Password must be at least 6 characters ✨' }
                    })}
                    className="w-full px-4 py-3 pl-12 pr-12 bg-green-50 border-2 border-green-100 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-300 text-gray-700 placeholder-green-300"
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
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaLock className="mr-2 text-green-500" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className="w-full px-4 py-3 bg-green-50 border-2 border-green-100 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-pink-600">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Updating... ✨' : 'Reset Password 🎊'}
              </button>
            </form>
          )}
        </div>

        {/* Cute Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <FaHeart className="text-pink-400 mr-2 animate-pulse" />
            Don't worry, we'll help you get back to cuteness! 🎀
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword