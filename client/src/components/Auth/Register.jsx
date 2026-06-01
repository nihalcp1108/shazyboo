import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../Context/AuthContext'
import { FaHeart, FaMagic, FaUser, FaPhone, FaEnvelope, FaLock, FaArrowRight, FaShieldAlt } from 'react-icons/fa'
import { GiCottonFlower } from 'react-icons/gi'

const Register = () => {
  const [loading, setLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    
    try {
      const result = await registerUser(data)
      
      if (result.success) {
        if (result.needsVerification) {
          // Redirect to OTP page for verification
          navigate('/verify-otp', { 
            state: { 
              email: data.email,
              from: 'register',
              debugOtp: result.debugOtp || null
            },
            replace: true
          })
          toast.success('🎉 Check your email for verification code!')
        } else {
          // For admin, redirect directly
          navigate('/', { replace: true })
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center py-12 px-4">
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-32 right-20 w-28 h-28 rounded-full bg-purple-200/20 animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 rounded-full bg-pink-200/20 animate-pulse delay-500"></div>
        <FaMagic className="absolute top-1/3 left-1/4 text-blue-300/30 text-4xl animate-bounce delay-200" />
      </div>

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                <FaHeart className="text-white text-5xl animate-pulse" />
              </div>
              <div className="absolute -top-3 -left-3">
                <GiCottonFlower className="text-pink-400 text-3xl animate-spin" style={{animationDuration: '20s'}} />
              </div>
              <div className="absolute -bottom-3 -right-3">
                <FaMagic className="text-yellow-400 text-2xl animate-spin" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Join Our Cute Community! 🎀
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Create your ShazyBoo account and unlock a world of adorable surprises! ✨
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaUser className="mr-2 text-pink-500" />
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('name', {
                      required: 'Name is required 👤',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters ✨'
                      }
                    })}
                    className="w-full px-4 py-3 pl-12 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                    placeholder="Your cute name"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaUser className="text-pink-400" />
                  </div>
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                    <span className="mr-1">💝</span> {errors.name.message}
                  </p>
                )}
              </div>
              
              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaPhone className="mr-2 text-pink-500" />
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Phone number is required 📱',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Please enter a valid 10-digit phone number 🔢'
                      }
                    })}
                    className="w-full px-4 py-3 pl-12 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                    placeholder="9876543210"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaPhone className="text-pink-400" />
                  </div>
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                    <span className="mr-1">💝</span> {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaLock className="mr-2 text-pink-500" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    {...register('password', {
                      required: 'Password is required 🔒',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters ✨'
                      }
                    })}
                    className="w-full px-4 py-3 pl-12 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                    placeholder="••••••••"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaLock className="text-pink-400" />
                  </div>
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
                  <FaShieldAlt className="mr-2 text-pink-500" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password 🔐',
                      validate: value => value === password || 'Passwords do not match 💝'
                    })}
                    className="w-full px-4 py-3 pl-12 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                    placeholder="••••••••"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaShieldAlt className="text-pink-400" />
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                    <span className="mr-1">💝</span> {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3 bg-pink-50/50 p-4 rounded-xl border border-pink-100">
              <input
                id="terms"
                type="checkbox"
                {...register('terms', {
                  required: 'You must accept the terms and conditions 📝'
                })}
                className="h-5 w-5 text-pink-500 focus:ring-pink-400 border-pink-300 rounded mt-1 transition-all duration-300 hover:scale-110 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="font-bold text-pink-600 hover:text-pink-700 transition-colors duration-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="font-bold text-pink-600 hover:text-pink-700 transition-colors duration-300">
                  Privacy Policy
                </Link>{' '}
                ✨
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-pink-600 flex items-center animate-pulse">
                <span className="mr-1">💝</span> {errors.terms.message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  <span className="animate-pulse">Creating your cute account... ✨</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">Start Your Cuteness Journey</span>
                  <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              )}
            </button>
            
            <div className="text-center pt-6 border-t border-pink-100">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-bold text-pink-600 hover:text-pink-700 transition-colors duration-300 hover:underline flex items-center justify-center mt-2"
                >
                  <span className="mr-2">Sign In</span>
                  <GiCottonFlower className="animate-pulse" />
                </Link>
              </p>
            </div>

            {/* Admin Note */}
            <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-700 text-center">
                <span className="font-bold">👑 Admin Registration:</span> 
                If you register with <code className="bg-amber-100 px-2 py-1 rounded">shazyboo.info@gmail.com</code>, 
                you'll be automatically verified and logged in!
              </p>
            </div>
          </form>
        </div>

        {/* Cute Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <FaHeart className="text-pink-400 mr-2 animate-pulse" />
            Welcome to the cutest shopping experience ever! 🎀
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register