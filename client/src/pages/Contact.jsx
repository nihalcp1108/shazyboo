import { useState } from 'react'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart, FaMagic, FaPaperPlane, FaHeadset, FaSmile } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'

const Contact = () => {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await api.post('/contact', data)
      if (response.data.success) {
        toast.success('🎉 Message sent successfully! Our cute team will get back to you soon!')
        reset()
      } else {
        toast.error('Something went wrong. Please try again later.')
      }
    } catch (error) {
      console.error('Contact error:', error)
      toast.error(error.response?.data?.error || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: <FaPhone />,
      title: 'Phone',
      details: ['+91 9567 16 17 16', '+91 9567 655 615', '+91 9778 034 171'],
      description: 'Mon-Sat from 10am to 7pm 🕐',
      color: 'from-pink-400 to-rose-400',
      bgColor: 'bg-pink-50'
    },
    {
      icon: <FaEnvelope />,
      title: 'Email',
      details: ['shazyboo.info@gmail.com'],
      description: 'We reply within 24 hours 📧',
      color: 'from-purple-400 to-indigo-400',
      bgColor: 'bg-purple-50'
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Office',
      details: ['Kakkad, Malappuram', 'Kerala, 676306'],
      description: 'Come visit our magical office! 🏢',
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'bg-blue-50'
    }
  ]

  const socialLinks = [
    { icon: <FaFacebook />, url: '#', label: 'Facebook', color: 'hover:bg-blue-500' },
    { icon: <FaTwitter />, url: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
    { icon: <FaInstagram />, url: 'https://www.instagram.com/shazy_boo_?igsh=MWlkbXdvYjlmYWZwMA==', label: 'Instagram', color: 'hover:bg-pink-500' },
    { icon: <FaLinkedin />, url: '#', label: 'LinkedIn', color: 'hover:bg-blue-600' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #ef63a4 0%, #f585b9 0%, #e4f1f6 100%)' }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-pink-300/20 -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-300/20 translate-x-48 translate-y-48"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <span className="text-white font-medium tracking-wide uppercase">Connect With Us</span>
          </div>
          
          <h1 className="fredoka text-5xl md:text-7xl text-white mb-6">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed font-medium">
            We are here to assist you. Reach out with any questions, feedback, or inquiries, and our team will get back to you promptly.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/90">
            <div className="flex items-center gap-2">
              <FaHeadset className="text-yellow-300" />
              <span className="font-semibold">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <FaSmile className="text-pink-200" />
              <span className="font-semibold">Dedicated Assistance</span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H1440V120C1440 120 1152 60 720 60C288 60 0 120 0 120V0Z" fill="var(--kiddex-bg)"/>
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4 mb-4 sm:mb-0">
                <FaPaperPlane className="text-white text-xl" />
              </div>
              <div>
                  <h2 className="fredoka text-3xl text-pink-600">
                    Send a Message
                  </h2>
                <p className="text-gray-600 mt-1">We typically respond within 24 hours.</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaHeart className="mr-2 text-pink-500 text-sm" />
                    First Name *
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'First name is required 👤' })}
                    className="w-full px-4 py-3 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                    placeholder="Your cute first name"
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                      <span className="mr-1">💝</span> {errors.firstName.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaHeart className="mr-2 text-pink-500 text-sm" />
                    Last Name *
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Last name is required 👤' })}
                    className="w-full px-4 py-3 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                    placeholder="Your lovely last name"
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                      <span className="mr-1">💝</span> {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaEnvelope className="mr-2 text-pink-500 text-sm" />
                  Email Address *
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required 💌',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address ✉️'
                    }
                  })}
                  className="w-full px-4 py-3 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                    <span className="mr-1">💝</span> {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaPhone className="mr-2 text-pink-500 text-sm" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone', {
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number 🔢'
                    }
                  })}
                  className="w-full px-4 py-3 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                  placeholder="9876543210"
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                    <span className="mr-1">💝</span> {errors.phone.message}
                    </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaMagic className="mr-2 text-pink-500 text-sm" />
                  Subject *
                </label>
                <select
                  {...register('subject', { required: 'Subject is required ✨' })}
                  className="w-full px-4 py-3 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700"
                >
                  <option value="">What's on your mind? 💭</option>
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Related</option>
                  <option value="return">Return/Exchange</option>
                  <option value="technical">Technical Support</option>
                  <option value="partnership">Business Partnership</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="other">Other</option>
                </select>
                {errors.subject && (
                  <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                    <span className="mr-1">💝</span> {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaHeart className="mr-2 text-pink-500 text-sm" />
                  Message *
                </label>
                <textarea
                  rows="6"
                  {...register('message', {
                    required: 'Message is required 📝',
                    minLength: {
                      value: 10,
                      message: 'Message must be at least 10 characters ✨'
                    }
                  })}
                  className="w-full px-4 py-3 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300 resize-none"
                  placeholder="Tell us everything! We're all ears! 👂"
                />
                {errors.message && (
                  <p className="mt-2 text-sm text-pink-600 flex items-center animate-pulse">
                    <span className="mr-1">💝</span> {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--kiddex-pink), var(--kiddex-orange))' }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    <span className="animate-pulse">Sprinkling magic on your message... ✨</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-3">Send Magical Message</span>
                    <FaPaperPlane className="group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4 mb-4 sm:mb-0">
                  <FaHeadset className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="fredoka text-3xl text-purple-600">
                    Get in Touch 🎀
                  </h2>
                  <p className="text-gray-600 mt-2">We're here to make your day brighter! ✨</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Have questions about our adorable products? Need help with an order? 
                Just want to share your cute shopping experience? Our friendly team is here 
                to help you every step of the way with lots of love and care! 💖
              </p>
            </div>

            <div className="space-y-8">
              {contactInfo.map((info, index) => (
                <div 
                  key={index} 
                  className={`${info.bgColor} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white`}
                >
                  <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                      <div className="text-2xl">{info.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-3 text-gray-800">{info.title}</h3>
                      <div className="space-y-2 mb-3">
                        {info.details.map((detail, i) => (
                          <p key={i} className="text-gray-700 font-medium">{detail}</p>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">{info.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-8 border border-pink-200">
              <h3 className="fredoka text-2xl text-gray-800 mb-6 text-center">
                Follow Our Cute Journey! 🌈
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className={`w-14 h-14 bg-white rounded-full flex items-center justify-center text-gray-600 ${social.color} hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200`}
                    aria-label={social.label}
                  >
                    <span className="text-2xl">{social.icon}</span>
                  </a>
                ))}
              </div>
              <p className="text-center text-gray-600 mt-6">
                Join our community of cute-lovers! Share your adorable finds with #ShazyBooCute 🎀
              </p>
            </div>

            {/* FAQ Preview */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mr-4 mb-4 sm:mb-0">
                  <span className="text-white text-xl">❓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Frequently Asked Questions 💭</h3>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-green-100 hover:border-green-300 transition-colors">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                    <span className="text-pink-500 mr-2">🎁</span>
                    What are your delivery times?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Standard delivery takes 3-5 business days. Express delivery is available for 1-2 business days with extra love! 💝
                  </p>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-green-100 hover:border-green-300 transition-colors">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                    <span className="text-purple-500 mr-2">✈️</span>
                    Do you offer international shipping?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Currently, we only ship within India. International shipping will be available soon to spread cuteness worldwide! 🌍
                  </p>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-green-100 hover:border-green-300 transition-colors">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                    <span className="text-blue-500 mr-2">🔄</span>
                    What is your return policy?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    We offer a 7-day return policy for unused items in original packaging. Happiness guaranteed! 😊
                  </p>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <a 
                  href="/faq" 
                  className="inline-flex items-center justify-center text-green-600 hover:text-green-700 font-bold transition-colors duration-300"
                >
                  See All Questions
                  <FaMagic className="ml-2 animate-pulse" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-white py-12" style={{ background: 'linear-gradient(135deg, #ef63a4 0%, #f585b9 0%, #e4f1f6 100%)' }}>
        <div className="container mx-auto px-4 text-center">
          <h3 className="fredoka text-3xl text-white mb-4">
            Still Have Questions? 🤔
          </h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Don't hesitate to reach out! We're here to make your experience absolutely adorable! ✨
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <a 
              href="tel:+919567161716" 
              className="bg-white text-pink-600 hover:bg-pink-50 px-6 sm:px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform hover:scale-105 flex items-center justify-center"
            >
              <FaPhone className="mr-3" />
              Call Us Now
            </a>
            <a 
              href="mailto:shazyboo.info@gmail.com" 
              className="border-2 border-white text-white hover:bg-white/20 px-6 sm:px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm flex items-center justify-center"
            >
              <FaEnvelope className="mr-3" />
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact