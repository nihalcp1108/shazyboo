import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { FaHeart, FaMagic, FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa'
import { GiCottonFlower } from 'react-icons/gi'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const { register, handleSubmit, formState: { errors } } = useForm()

  // Check for pending verification
  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingVerificationEmail')
    if (pendingEmail) {
      toast.success('Please verify your email to continue!', { duration: 5000 })
    }
  }, [])

  const onSubmit = async (data) => {
    console.log('Login attempt with email:', data.email)
    setLoading(true)
    try {
      const result = await login(data.email, data.password)
      console.log('Full login result:', result)
      
      // Check if result exists
      if (!result) {
        console.error('Login returned null or undefined')
        toast.error('Login failed. Please try again.')
        setLoading(false)
        return
      }
      
      // Handle successful login
      if (result.success === true) {
        // Check if user exists in result
        if (!result.user) {
          console.error('Login success but no user data received')
          toast.error('Login failed: No user data received')
          setLoading(false)
          return
        }
        
        // Check if user is admin (case insensitive for email)
        const userEmail = result.user.email?.toLowerCase()
        const isAdminUser = result.user.role === 'admin' || 
                           userEmail === 'shazybooinfo@gmail.com' ||
                           userEmail === 'shazyboo.info@gmail.com'
        
        console.log('Is admin?', isAdminUser, 'User role:', result.user.role, 'User email:', result.user.email)
        
        if (isAdminUser) {
          console.log('Redirecting to admin dashboard...')
          navigate('/admin/dashboard', { replace: true })
        } else {
          console.log('Redirecting to:', from)
          navigate(from, { replace: true })
        }
        toast.success(`✨ Welcome back, ${result.user.name}!`)
      } 
      // Handle verification needed
      else if (result.needsVerification === true) {
        localStorage.setItem('pendingVerificationEmail', result.email || data.email)
        navigate('/verify-otp', { 
          state: { 
            email: result.email || data.email,
            from: 'login'
          },
          replace: true
        })
        toast.success('✨ Please verify your email first! OTP sent.')
      } 
      // Handle other failures
      else if (result.success === false) {
        // Error already shown in auth context
        console.log('Login failed:', result.error)
      }
      // Handle unexpected result structure
      else {
        console.error('Unexpected login result structure:', result)
        toast.error('Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Unexpected login error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onError = (errors) => {
    console.log('Form validation errors:', errors)
  }

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
                <FaHeart className="text-white text-4xl animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2">
                <FaMagic className="text-yellow-400 text-xl animate-spin" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back! 💖
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to your ShazyBoo account and dive into cuteness! 🎀
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaEnvelope className="mr-2 text-pink-500" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    autoComplete="email"
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
              
              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaLock className="mr-2 text-pink-500" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register('password', {
                      required: 'Password is required 🔒',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters ✨'
                      }
                    })}
                    className="w-full px-4 py-3 pl-12 pr-12 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaLock className="text-pink-400" />
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-pink-500 focus:ring-pink-400 border-pink-300 rounded transition-all duration-300 hover:scale-110 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700">
                  Remember me 💭
                </label>
              </div>

              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors duration-300 hover:underline flex items-center"
              >
                Forgot password? 🔑
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  <span className="animate-pulse">Sprinkling magic... ✨</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">Sign In to Cuteness</span>
                  <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              )}
            </button>
            
            <div className="text-center pt-6 border-t border-pink-100">
              <p className="text-gray-600">
                New to ShazyBoo?{' '}
                <Link 
                  to="/register" 
                  className="font-bold text-pink-600 hover:text-pink-700 transition-colors duration-300 hover:underline inline-flex items-center"
                >
                  Create Account
                  <GiCottonFlower className="ml-2 animate-pulse" />
                </Link>
              </p>
            </div>

            {/* Special Note for Admin */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 text-center">
                <span className="font-bold">👑 Admin Note:</span> 
                Use <code className="bg-blue-100 px-2 py-1 rounded mx-1">shazyboo.info@gmail.com</code> or <code className="bg-blue-100 px-2 py-1 rounded mx-1">shazybooinfo@gmail.com</code>
                to login as admin (auto-verified) 🎯
              </p>
            </div>
          </form>
        </div>

        {/* Cute Footer Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <FaHeart className="text-pink-400 mr-2 animate-pulse" />
            Every login brings more cuteness to your life! 🎀
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login