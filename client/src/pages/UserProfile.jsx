import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../Context/AuthContext'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaLock, FaShieldAlt, FaCalendar, FaCheck, FaMagic, FaHeart, FaCrown } from 'react-icons/fa'
import { GiCottonFlower } from 'react-icons/gi'

const UserProfile = () => {
  const { user, updateProfile, updatePassword } = useAuth()
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    }
  })

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, watch } = useForm()
  const newPassword = watch('newPassword')

  const onProfileSubmit = async (data) => {
    setLoading(true)
    const result = await updateProfile(data)
    setLoading(false)
    
    if (result.success) {
      setEditing(false)
      toast.success('✨ Profile updated successfully! Looking cute!')
    }
  }

  const onPasswordSubmit = async (data) => {
    setLoading(true)
    const result = await updatePassword(data.currentPassword, data.newPassword)
    setLoading(false)
    
    if (result.success) {
      setChangingPassword(false)
      resetPassword()
      toast.success('🔐 Password updated successfully! Stay secure!')
    }
  }

  const addresses = user?.addresses || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 rounded-full px-8 py-4 shadow-lg mb-6">
            <FaUser className="text-pink-500 mr-3 text-2xl" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              My Cute Profile 🎀
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome back, {user?.name}! Manage your account and keep everything adorable! ✨
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
                    <FaUser className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                    <p className="text-gray-600">Your magical details ✨</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (editing) {
                      resetProfile()
                    }
                    setEditing(!editing)
                  }}
                  className={`group flex items-center space-x-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    editing 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-xl hover:-translate-y-1' 
                      : 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 hover:from-pink-200 hover:to-purple-200'
                  }`}
                >
                  {editing ? (
                    <>
                      <FaSave className="group-hover:animate-pulse" />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <FaEdit />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <FaHeart className="mr-2 text-pink-500" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        {...registerProfile('name', { required: 'Name is required 👤' })}
                        className="w-full px-4 py-3 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                        placeholder="Your cute name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <FaPhone className="mr-2 text-pink-500" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        {...registerProfile('phone', { required: 'Phone is required 📱' })}
                        className="w-full px-4 py-3 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                        placeholder="Phone no"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FaEnvelope className="mr-2 text-pink-500" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...registerProfile('email')}
                      className="w-full px-4 py-3 bg-pink-50 border-2 border-pink-100 rounded-xl text-gray-700 opacity-70 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                      <FaMagic className="mr-2 text-yellow-500" />
                      Email cannot be changed (it's part of your magic!)
                    </p>
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
                        <span className="mr-3">Save Cute Changes</span>
                        <FaHeart className="group-hover:animate-pulse" />
                      </div>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-pink-50 rounded-xl border border-pink-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-400 rounded-lg flex items-center justify-center">
                      <FaUser className="text-white text-xl" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-bold text-lg text-gray-800">{user?.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg flex items-center justify-center">
                      <FaEnvelope className="text-white text-xl" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-bold text-lg text-gray-800">{user?.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                      <FaPhone className="text-white text-xl" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-bold text-lg text-gray-800">{user?.phone}</div>
                    </div>
                  </div>

                  {user?.role === 'admin' && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <FaCrown className="text-yellow-500 text-2xl" />
                        <div>
                          <div className="font-bold text-gray-800">Admin Privileges</div>
                          <div className="text-sm text-gray-600">You have special magical powers! ✨</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Addresses */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                    <FaMapMarkerAlt className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Saved Addresses</h2>
                    <p className="text-gray-600">Your magical delivery spots 🏡</p>
                  </div>
                </div>
                <button className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center">
                  <span className="mr-3">+ Add New Address</span>
                  <GiCottonFlower className="group-hover:animate-pulse" />
                </button>
              </div>

              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address, index) => (
                    <div 
                      key={index} 
                      className="group bg-gradient-to-b from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-pink-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <FaMapMarkerAlt className="text-pink-500" />
                          </div>
                          <div>
                            <div className="font-bold text-lg text-gray-800">{address.name}</div>
                            {address.isDefault && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 mt-1">
                                <FaCheck className="mr-1" /> Default
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-pink-500 transition-colors">
                          <FaEdit />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-gray-700">{address.street}</p>
                        <p className="text-gray-700">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-gray-700">{address.country}</p>
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600 flex items-center">
                            <FaPhone className="mr-2 text-gray-400" />
                            {address.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaMapMarkerAlt className="text-blue-400 text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Addresses Yet</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Add your first address to make shopping even more magical! We'll deliver cuteness right to your doorstep! 🎀
                  </p>
                  <button className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center mx-auto">
                    <span className="mr-3">Add Magical Address</span>
                    <GiCottonFlower className="group-hover:animate-pulse" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Account Security */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4">
                  <FaShieldAlt className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Account Security</h2>
                  <p className="text-gray-600">Keep your magic safe! 🔐</p>
                </div>
              </div>
              
              {changingPassword ? (
                <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FaLock className="mr-2 text-pink-500" />
                      Current Password *
                    </label>
                    <input
                      type="password"
                      {...registerPassword('currentPassword', { required: 'Current password is required 🔒' })}
                      className="w-full px-4 py-3 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FaMagic className="mr-2 text-purple-500" />
                      New Password *
                    </label>
                    <input
                      type="password"
                      {...registerPassword('newPassword', { required: 'New password is required ✨' })}
                      className="w-full px-4 py-3 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FaCheck className="mr-2 text-green-500" />
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your password 🔐',
                        validate: value => value === newPassword || 'Passwords do not match 💝'
                      })}
                      className="w-full px-4 py-3 bg-pink-50 border-2 border-pink-100 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 text-gray-700 placeholder-pink-300"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setChangingPassword(false)
                        resetPassword()
                      }}
                      className="flex-1 group bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                    >
                      {loading ? 'Updating...' : 'Update Magic'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <p className="text-gray-600 leading-relaxed">
                    Keep your account secure by regularly updating your magical password. 
                    Strong passwords help protect your cute shopping adventures! ✨
                  </p>
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="w-full group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform hover:scale-[1.02] flex items-center justify-center"
                  >
                    <span className="mr-3">Change Password</span>
                    <FaLock className="group-hover:animate-pulse" />
                  </button>
                </div>
              )}
            </div>

            {/* Account Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4">
                  <FaHeart className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Account Status</h2>
                  <p className="text-gray-600">Your magical journey with us ✨</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                  <div className="flex items-center">
                    <FaCalendar className="text-pink-500 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Member Since</div>
                      <div className="font-bold text-gray-800">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="text-pink-500">🎂</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Email Verified</div>
                      <div className={`font-bold ${user?.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {user?.isVerified ? 'Verified ✅' : 'Not Verified ❌'}
                      </div>
                    </div>
                  </div>
                  {user?.isVerified ? (
                    <div className="text-green-500">✨</div>
                  ) : (
                    <button className="text-sm text-red-500 hover:text-red-600 font-bold">
                      Verify
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <div className="flex items-center">
                    <FaCrown className="text-yellow-500 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Account Type</div>
                      <div className="font-bold text-gray-800 capitalize">
                        {user?.role === 'admin' ? 'Magical Admin ✨' : 'Cute Member 🎀'}
                      </div>
                    </div>
                  </div>
                  <div className="text-yellow-500">👑</div>
                </div>

                {user?.role === 'admin' && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center">
                      <FaMagic className="text-yellow-500 mr-3 text-xl" />
                      <div>
                        <div className="font-bold text-gray-800">Admin Access</div>
                        <a 
                          href="/admin/dashboard" 
                          className="text-sm text-yellow-600 hover:text-yellow-700 font-bold"
                        >
                          Go to Dashboard →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cute Tip */}
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 border border-pink-200">
              <div className="flex items-center mb-4">
                <GiCottonFlower className="text-pink-500 mr-3 text-2xl" />
                <h3 className="font-bold text-gray-800">Cute Tip of the Day! 💡</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Complete your profile and verify your email to unlock special magical offers 
                and make your shopping experience even more adorable! ✨
              </p>
              <div className="mt-4 flex items-center text-sm text-pink-600 font-bold">
                <FaHeart className="mr-2 animate-pulse" />
                Keep spreading the cuteness!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile