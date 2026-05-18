import axios from 'axios'

// Use environment variable or fallback to localhost
const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:5001/api'
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased to 30 seconds for slower connections
  withCredentials: false, // Set to true if you need cookies
})

// Add a request interceptor to log requests and handle FormData
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`)

    // Add auth token if exists
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 Token added to request headers')
    }

    // CRITICAL FIX: If sending FormData, let browser set the Content-Type with boundary
    if (config.data instanceof FormData) {
      console.log('📦 Sending FormData - removing Content-Type header')
      delete config.headers['Content-Type']
      // Log FormData contents for debugging
      console.log('FormData contents:')
      for (let pair of config.data.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`)
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`)
        }
      }
    } else {
      console.log('Request data:', config.data)
    }

    return config
  },
  (error) => {
    console.error('📤 API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.config.url}`, response.status)
    console.log('Response data:', response.data)
    return response
  },
  (error) => {
    // Log full error details
    console.error('📥 API Response Error:')
    console.error('Status:', error.response?.status)
    console.error('Status Text:', error.response?.statusText)
    console.error('Data:', error.response?.data)
    console.error('Message:', error.message)
    console.error('Config:', error.config)

    // Check if it's a network error
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout')
      error.customMessage =
        'Request timed out. Please check your connection.'
    } else if (error.message === 'Network Error') {
      console.error('Network error - backend might be down')
      error.customMessage =
        'Cannot connect to server. Please check backend connection.'
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - Checking if verification needed')

      if (error.response?.data?.needsVerification) {
        console.log('📧 Verification needed - not clearing session')
      } else {
        console.log('Clearing session due to unauthorized')

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        delete api.defaults.headers.common['Authorization']

        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/verify-otp') &&
          !window.location.pathname.includes('/register')
        ) {
          window.location.href = '/login'
        }
      }
    }

    // Handle 400 Bad Request
    if (error.response?.status === 400) {
      console.error('❌ Bad Request - Check your input data')

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Invalid data provided'

      console.error('Error details:', errorMessage)
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('🔥 Server Error - Check backend logs')
    }

    // Handle CORS errors
    if (error.message?.includes('CORS')) {
      console.error('CORS error - check backend CORS settings')

      error.customMessage =
        'CORS error. Please check backend configuration.'
    }

    // Enhance error object with custom message
    if (error.customMessage) {
      error.response = error.response || {}
      error.response.data = error.response.data || {}

      error.response.data.message = error.customMessage
    }

    return Promise.reject(error)
  }
)

// Helper function to test API connection
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection to:', API_URL)
    const response = await api.get('/health')
    console.log('API connection successful:', response.data)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('API connection failed:', error.message)
    return { success: false, error: error.message }
  }
}

// Helper function to test login directly (for debugging)
export const testDirectLogin = async (email, password) => {
  try {
    console.log('Testing direct login for:', email)
    const response = await axios.post(`${API_URL}/auth/login`, { email, password }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    })
    console.log('Direct login successful:', response.data)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Direct login failed:', error.response?.data || error.message)
    return { success: false, error: error.response?.data || error.message }
  }
}

// Helper function to test product creation (for debugging)
export const testProductCreation = async (formData) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No token found')
      return { success: false, error: 'No authentication token' }
    }

    console.log('Testing product creation...')
    const response = await axios.post(`${API_URL}/admin/products`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let axios set it with boundary
      },
      timeout: 30000
    })
    console.log('Product creation successful:', response.data)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Product creation failed:', error.response?.data || error.message)
    return { success: false, error: error.response?.data || error.message }
  }
}

export default api  