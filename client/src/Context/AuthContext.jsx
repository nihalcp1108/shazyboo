import { createContext, useState, useContext, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'
import { useCart } from './CartContext'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { mergeGuestCart } = useCart()

  // Check for existing user session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          console.log('User session restored:', parsedUser.email)
          
          // Verify token is still valid
          try {
            await api.get('/auth/me')
            console.log('Token is valid')
          } catch (error) {
            console.error('Token validation failed, clearing session')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
            delete api.defaults.headers.common['Authorization']
          }
        } catch (error) {
          console.error('Error parsing stored user:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }
    
    initializeAuth()
  }, [])

  // Login user - FIXED VERSION
  const login = async (email, password) => {
    try {
      console.log('🔐 Login attempt for:', email)
      
      // Make sure we have email and password
      if (!email || !password) {
        console.error('Missing email or password')
        toast.error('Please provide both email and password')
        return { success: false, error: 'Missing credentials' }
      }
      
      const response = await api.post('/auth/login', { email, password })
      console.log('✅ Full login response:', JSON.stringify(response.data, null, 2))
      
      // Check if response has data
      if (!response.data) {
        console.error('No data in response')
        toast.error('Server returned an empty response')
        return { success: false, error: 'Empty response from server' }
      }
      
      // Log specifically what we're getting
      console.log('Response data type:', typeof response.data)
      console.log('Response data keys:', Object.keys(response.data))
      console.log('Token present?', !!response.data.token)
      console.log('User present?', !!response.data.user)
      
      // Check if token and user exist in response
      if (!response.data.token) {
        console.error('No token in response:', response.data)
        toast.error('Invalid server response: missing authentication token')
        return { success: false, error: 'Missing token in response' }
      }
      
      if (!response.data.user) {
        console.error('No user data in response:', response.data)
        toast.error('Invalid server response: missing user data')
        return { success: false, error: 'Missing user data in response' }
      }
      
      const { token, user: userData } = response.data
      
      // Set admin role for admin emails (case insensitive)
      const adminEmails = ['shazyboo.info@gmail.com', 'shazybooinfo@gmail.com']
      if (adminEmails.includes(email.toLowerCase())) {
        userData.role = 'admin'
        console.log('👑 Admin user detected and role set')
      }
      
      // Ensure userData has required fields
      if (!userData.name) {
        userData.name = email.split('@')[0] // Fallback name
      }
      
      // Store user data and token
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      
      // Merge guest cart with user cart
      try {
        await mergeGuestCart()
        console.log('🛒 Cart merged successfully')
      } catch (cartError) {
        console.error('Cart merge error:', cartError)
        // Don't fail login if cart merge fails
      }
      
      // Return success with user data
      return { success: true, user: userData }
      
    } catch (error) {
      console.error('❌ Login error:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      
      // Handle network errors
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout')
        toast.error('Request timed out. Please check your connection.')
        return { success: false, error: 'Request timeout' }
      }
      
      if (error.message === 'Network Error') {
        console.error('Network error - backend might be down')
        toast.error('Cannot connect to server. Please check if backend is running.')
        return { success: false, error: 'Network error' }
      }
      
      // Check if there's a response with needsVerification flag
      if (error.response?.data?.needsVerification) {
        console.log('📧 User needs verification, storing email for OTP')
        localStorage.setItem('pendingVerificationEmail', email)
        toast.success('Please verify your email first! OTP sent.')
        return { 
          success: false, 
          needsVerification: true,
          email: email 
        }
      }
      
      // Check for specific error status codes
      if (error.response?.status === 401) {
        console.log('🔐 Unauthorized - Invalid credentials')
        toast.error('Invalid email or password. Please try again.')
        return { success: false, error: 'Invalid credentials' }
      }
      
      if (error.response?.status === 403) {
        console.log('🚫 Forbidden - Account blocked')
        toast.error('Your account has been blocked. Please contact support.')
        return { success: false, error: 'Account blocked' }
      }
      
      if (error.response?.status === 404) {
        console.log('🔍 Not found - API endpoint issue')
        toast.error('Service unavailable. Please try again later.')
        return { success: false, error: 'API endpoint not found' }
      }
      
      // Get error message from response
      let errorMessage = 'Login failed 😢'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      console.log('Final error message:', errorMessage)
      
      // Check if error message indicates verification needed
      if (errorMessage.toLowerCase().includes('verify') || errorMessage.toLowerCase().includes('otp')) {
        console.log('📧 User needs verification based on error message')
        localStorage.setItem('pendingVerificationEmail', email)
        toast.success('Please verify your email first! OTP sent.')
        return { 
          success: false, 
          needsVerification: true,
          email: email 
        }
      }
      
      // Only show toast for errors that aren't already handled
      if (!errorMessage.includes('verify') && !errorMessage.includes('OTP')) {
        toast.error(errorMessage)
      }
      
      return { success: false, error: errorMessage }
    }
  }

  // Register new user
  const register = async (userData) => {
    try {
      setLoading(true)
      console.log('📝 Registration attempt for:', userData.email)
      const response = await api.post('/auth/register', userData)
      const result = response.data
      console.log('✅ Registration response:', result)
      
      // Auto-login admin users
      const adminEmails = ['shazyboo.info@gmail.com', 'shazybooinfo@gmail.com']
      if (adminEmails.includes(userData.email.toLowerCase()) && result.token) {
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        api.defaults.headers.common['Authorization'] = `Bearer ${result.token}`
        setUser(result.user)
        
        try {
          await mergeGuestCart()
          console.log('🛒 Cart merged for admin')
        } catch (cartError) {
          console.error('Cart merge error:', cartError)
        }
        
        toast.success('🎉 Admin registration successful!')
        return { success: true, user: result.user }
      } 
      // Regular users need OTP verification
      else if (result.needsVerification) {
        localStorage.setItem('pendingVerificationEmail', data.email)
        // Show server-provided warning if email delivery failed
        if (result.warning) {
          toast(result.warning, { icon: '⚠️' })
        }
        toast.success(result.message || 'Registration successful! Please check your email for verification OTP.')
        return { 
          success: true, 
          needsVerification: true,
          email: userData.email,
          warning: result.warning || null
        }
      } else {
        // Direct login for already verified users
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        api.defaults.headers.common['Authorization'] = `Bearer ${result.token}`
        setUser(result.user)
        
        try {
          await mergeGuestCart()
        } catch (cartError) {
          console.error('Cart merge error:', cartError)
        }
        
        toast.success('🎉 Registration successful! Welcome to ShazyBoo!')
        return { success: true, user: result.user }
      }
    } catch (error) {
      console.error('❌ Registration error:', error)
      const responseData = error?.response?.data
      const errorMessage =
        responseData?.error ||
        responseData?.message ||
        (typeof responseData === 'string' ? responseData : null) ||
        error?.message ||
        'Registration failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP
  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true)
      console.log('🔍 Verifying OTP for:', email, 'OTP:', otp)
      const response = await api.post('/auth/verify-otp', { email, otp })
      const { token, user: userData } = response.data
      console.log('✅ OTP verification successful:', userData)
      
      // Set admin role for admin emails
      const adminEmails = ['shazyboo.info@gmail.com', 'shazybooinfo@gmail.com']
      if (adminEmails.includes(email.toLowerCase())) {
        userData.role = 'admin'
      }
      
      // Store user data and token
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.removeItem('pendingVerificationEmail')
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      
      try {
        await mergeGuestCart()
        console.log('🛒 Cart merged after verification')
      } catch (cartError) {
        console.error('Cart merge error:', cartError)
      }
      
      toast.success('🎊 Email verified successfully! Welcome to ShazyBoo!')
      return { success: true, user: userData }
    } catch (error) {
      console.error('❌ OTP verification error:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Verification failed 😢'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const resendOTP = async (email) => {
    try {
      console.log('🔄 Resending OTP for:', email)
      const response = await api.post('/auth/resend-otp', { email })
      console.log('✅ Resend OTP response:', response.data)
      toast.success('✨ New OTP sent to your email!')
      return { success: true }
    } catch (error) {
      console.error('❌ Resend OTP error:', error)
      const responseData = error?.response?.data
      const errorMessage =
        responseData?.error ||
        responseData?.message ||
        (typeof responseData === 'string' ? responseData : null) ||
        'Failed to resend OTP 😢'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Check OTP Status
  const checkOTPStatus = async (email) => {
    try {
      console.log('🔍 Checking OTP status for:', email)
      const response = await api.get(`/auth/otp-status/${email}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('❌ Check OTP status error:', error)
      return { success: false, error: error.response?.data?.error }
    }
  }

  // Logout user
  const logout = () => {
    console.log('👋 Logging out user:', user?.email)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('pendingVerificationEmail')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('👋 Logged out successfully! Come back soon!')
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      console.log('📝 Updating profile for:', user?.email)
      const response = await api.put('/auth/updatedetails', userData)
      const updatedUser = response.data.user
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('✨ Profile updated successfully!')
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('❌ Profile update error:', error)
      const errorMessage = error.response?.data?.error || 'Update failed 😢'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      console.log('🔐 Updating password for:', user?.email)
      const response = await api.put('/auth/updatepassword', {
        currentPassword,
        newPassword
      })
      console.log('✅ Password updated successfully')
      
      // Update token if returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      }
      
      toast.success('🔐 Password updated successfully!')
      return { success: true }
    } catch (error) {
      console.error('❌ Password update error:', error)
      const errorMessage = error.response?.data?.error || 'Password update failed 😢'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Forgot password - send reset email
  const forgotPassword = async (email) => {
    try {
      console.log('📧 Forgot password request for:', email)
      const response = await api.post('/auth/forgotpassword', { email })
      console.log('✅ Forgot password response:', response.data)
      
      toast.success(response.data.message || '📧 OTP sent to your email!')
      return { success: true, email: response.data.email || email }
    } catch (error) {
      console.error('❌ Forgot password error:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to send OTP 😢'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Verify Password Reset OTP
  const verifyResetOTP = async (email, otp) => {
    try {
      setLoading(true)
      console.log('🔍 Verifying reset OTP for:', email)
      const response = await api.post('/auth/verify-reset-otp', { email, otp })
      console.log('✅ Reset OTP verified:', response.data)
      
      return { success: true, resetToken: response.data.resetToken }
    } catch (error) {
      console.error('❌ Reset OTP verification error:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'OTP verification failed 😢'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Reset password with token
  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      setLoading(true)
      console.log('🔐 Resetting password with token:', token)
      const response = await api.put(`/auth/resetpassword/${token}`, {
        password: newPassword,
        confirmPassword: confirmPassword
      })
      console.log('✅ Reset password response:', response.data)
      
      const { token: newToken, user: userData } = response.data
      
      // Store new user data and token
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      setUser(userData)
      
      toast.success('🎊 Password reset successful! Welcome back!')
      return { success: true, user: userData }
    } catch (error) {
      console.error('❌ Reset password error:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Password reset failed 😢'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Get current user
  const getCurrentUser = async () => {
    try {
      console.log('👤 Getting current user')
      const response = await api.get('/auth/me')
      const userData = response.data.user
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, user: userData }
    } catch (error) {
      console.error('❌ Get current user error:', error)
      return { success: false, error: error.response?.data?.error }
    }
  }

  // Add address
  const addAddress = async (addressData) => {
    try {
      console.log('📍 Adding new address')
      const response = await api.post('/auth/address', addressData)
      console.log('✅ Address added successfully')
      
      // Update user with new address
      if (response.data.address && user) {
        const updatedUser = { ...user }
        if (!updatedUser.addresses) updatedUser.addresses = []
        updatedUser.addresses.push(response.data.address)
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      
      toast.success('📍 Address added successfully!')
      return { success: true, address: response.data.address }
    } catch (error) {
      console.error('❌ Add address error:', error)
      const errorMessage = error.response?.data?.error || 'Failed to add address'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Get all addresses
  const getAddresses = async () => {
    try {
      console.log('📍 Fetching addresses')
      const response = await api.get('/auth/address')
      return { success: true, addresses: response.data.addresses }
    } catch (error) {
      console.error('❌ Get addresses error:', error)
      return { success: false, error: error.response?.data?.error }
    }
  }

  // Update address
  const updateAddress = async (addressId, addressData) => {
    try {
      console.log('✏️ Updating address:', addressId)
      const response = await api.put(`/auth/address/${addressId}`, addressData)
      console.log('✅ Address updated successfully')
      
      // Update user's address in state
      if (response.data.address && user && user.addresses) {
        const updatedAddresses = user.addresses.map(addr => 
          addr._id === addressId ? response.data.address : addr
        )
        const updatedUser = { ...user, addresses: updatedAddresses }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      
      toast.success('✏️ Address updated successfully!')
      return { success: true, address: response.data.address }
    } catch (error) {
      console.error('❌ Update address error:', error)
      const errorMessage = error.response?.data?.error || 'Failed to update address'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Delete address
  const deleteAddress = async (addressId) => {
    try {
      console.log('🗑️ Deleting address:', addressId)
      await api.delete(`/auth/address/${addressId}`)
      console.log('✅ Address deleted successfully')
      
      // Remove address from user state
      if (user && user.addresses) {
        const updatedAddresses = user.addresses.filter(addr => addr._id !== addressId)
        const updatedUser = { ...user, addresses: updatedAddresses }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      
      toast.success('🗑️ Address deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('❌ Delete address error:', error)
      const errorMessage = error.response?.data?.error || 'Failed to delete address'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Test email service (for debugging)
  const testEmailService = async (email) => {
    try {
      console.log('🧪 Testing email service for:', email)
      const response = await api.post('/auth/test-email', { email })
      console.log('✅ Test email response:', response.data)
      toast.success('Test email sent! Check your inbox.')
      return { success: true, data: response.data }
    } catch (error) {
      console.error('❌ Test email error:', error)
      toast.error('Failed to send test email')
      return { success: false, error: error.response?.data?.error }
    }
  }

  // Context value
  const value = {
    // State
    user,
    loading,
    
    // Authentication
    login,
    register,
    logout,
    getCurrentUser,
    
    // OTP Verification
    verifyOTP,
    resendOTP,
    checkOTPStatus,
    
    // Password Management
    updatePassword,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    
    // Profile Management
    updateProfile,
    
    // Address Management
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    
    // Utilities
    testEmailService,
    
    // Helpers
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || 
             user?.email?.toLowerCase() === 'shazyboo.info@gmail.com' || 
             user?.email?.toLowerCase() === 'shazybooinfo@gmail.com'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}