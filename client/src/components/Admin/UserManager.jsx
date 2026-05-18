import { useState, useEffect } from 'react'
import { FaSearch, FaEdit, FaTrash, FaUserShield, FaUser, FaBan, FaCheck, FaEye } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'

const UserManager = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({
        role: '',
        blocked: '',
        verified: ''
    })
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [selectedUser, setSelectedUser] = useState(null)
    const [showUserDetails, setShowUserDetails] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [page, search, filters])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const params = {
                page,
                limit: 10,
                ...(search && { search }),
                ...(filters.role && { role: filters.role }),
                ...(filters.blocked !== '' && { blocked: filters.blocked }),
                ...(filters.verified !== '' && { verified: filters.verified })
            }
            const response = await api.get('/admin/users', { params })
            setUsers(response.data.data)
            setTotalPages(response.data.pagination.pages)
        } catch (error) {
            toast.error('Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin'
        
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            return
        }

        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole })
            toast.success(`User role updated to ${newRole}`)
            fetchUsers()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user role')
        }
    }

    const handleBlockToggle = async (userId, currentStatus) => {
        const action = currentStatus ? 'unblock' : 'block'
        
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
            return
        }

        try {
            await api.put(`/admin/users/${userId}/block`, { isBlocked: !currentStatus })
            toast.success(`User ${action}ed successfully`)
            fetchUsers()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user status')
        }
    }

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return
        }

        try {
            await api.delete(`/admin/users/${userId}`)
            toast.success('User deleted successfully')
            fetchUsers()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user')
        }
    }

    const viewUserDetails = async (userId) => {
        try {
            const response = await api.get(`/admin/users/${userId}`)
            setSelectedUser(response.data.data.user)
            setShowUserDetails(true)
        } catch (error) {
            toast.error('Failed to fetch user details')
        }
    }

    const handleFilter = (type, value) => {
        if (type === 'clear') {
            setSearch('')
            setFilters({
                role: '',
                blocked: '',
                verified: ''
            })
        } else if (type === 'role') {
            setFilters(prev => ({
                ...prev,
                role: value,
                blocked: '',
                verified: ''
            }))
            setSearch('')
        } else if (type === 'blocked') {
            setFilters(prev => ({
                ...prev,
                blocked: 'true',
                role: '',
                verified: ''
            }))
            setSearch('')
        } else if (type === 'verified') {
            setFilters(prev => ({
                ...prev,
                verified: 'false',
                role: '',
                blocked: ''
            }))
            setSearch('')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users by name, email, or phone..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
                    />
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                    <button 
                        onClick={() => handleFilter('clear')}
                        className={`px-3 py-1 rounded-full text-sm ${
                            !search && !filters.role && !filters.blocked && !filters.verified 
                                ? 'bg-lavender-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All Users
                    </button>
                    <button 
                        onClick={() => handleFilter('role', 'admin')}
                        className={`px-3 py-1 rounded-full text-sm ${
                            filters.role === 'admin'
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                    >
                        Admins
                    </button>
                    <button 
                        onClick={() => handleFilter('blocked', 'true')}
                        className={`px-3 py-1 rounded-full text-sm ${
                            filters.blocked === 'true'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                    >
                        Blocked
                    </button>
                    <button 
                        onClick={() => handleFilter('verified', 'false')}
                        className={`px-3 py-1 rounded-full text-sm ${
                            filters.verified === 'false'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                    >
                        Unverified
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-lavender-100 rounded-full flex items-center justify-center text-lavender-600 font-semibold">
                                                    {user.name?.charAt(0).toUpperCase() || <FaUser />}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <button
                                                        onClick={() => viewUserDetails(user._id)}
                                                        className="text-xs text-blue-600 hover:text-blue-900"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{user.phone || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {user.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                                {user.isBlocked && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                                        Blocked
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => viewUserDetails(user._id)}
                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleRoleChange(user._id, user.role)}
                                                    className={`p-1 ${
                                                        user.role === 'admin' 
                                                            ? 'text-yellow-600 hover:text-yellow-900' 
                                                            : 'text-purple-600 hover:text-purple-900'
                                                    }`}
                                                    title={user.role === 'admin' ? 'Make User' : 'Make Admin'}
                                                >
                                                    <FaUserShield />
                                                </button>
                                                <button
                                                    onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                                                    className={`p-1 ${
                                                        user.isBlocked 
                                                            ? 'text-green-600 hover:text-green-900' 
                                                            : 'text-red-600 hover:text-red-900'
                                                    }`}
                                                    title={user.isBlocked ? 'Unblock User' : 'Block User'}
                                                >
                                                    {user.isBlocked ? <FaCheck /> : <FaBan />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Delete User"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                    <button
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        className={`px-3 py-2 rounded ${
                            page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1
                        if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= page - 1 && pageNumber <= page + 1)
                        ) {
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => setPage(pageNumber)}
                                    className={`px-3 py-2 rounded ${
                                        page === pageNumber
                                            ? 'bg-lavender-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            )
                        }
                        return null
                    })}
                    
                    <button
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages}
                        className={`px-3 py-2 rounded ${
                            page === totalPages
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* User Details Modal */}
            {showUserDetails && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">User Details</h3>
                                <button
                                    onClick={() => setShowUserDetails(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* User Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-2">Personal Information</h4>
                                        <div className="space-y-2">
                                            <p><span className="font-medium">Name:</span> {selectedUser.name}</p>
                                            <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                                            <p><span className="font-medium">Phone:</span> {selectedUser.phone || 'N/A'}</p>
                                            <p><span className="font-medium">Role:</span> {selectedUser.role}</p>
                                            <p><span className="font-medium">Joined:</span> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-2">Account Status</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-2 ${selectedUser.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                <span>Verified: {selectedUser.isVerified ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-2 ${selectedUser.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <span>Blocked: {selectedUser.isBlocked ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Addresses */}
                                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Addresses</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedUser.addresses.map((address, index) => (
                                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-medium">{address.name}</span>
                                                        {address.isDefault && (
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Default</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm">{address.street}</p>
                                                    <p className="text-sm">{address.city}, {address.state} {address.zipCode}</p>
                                                    <p className="text-sm">{address.country}</p>
                                                    <p className="text-sm mt-2">Phone: {address.phone}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Wishlist */}
                                {selectedUser.wishlist && selectedUser.wishlist.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Wishlist Items</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedUser.wishlist.map((product) => (
                                                <div key={product._id} className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        {product.images && product.images[0] && (
                                                            <img 
                                                                src={product.images[0].url} 
                                                                alt={product.name}
                                                                className="w-12 h-12 object-cover rounded"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-medium">{product.name}</p>
                                                            <p className="text-sm text-gray-600">₹{product.price}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end space-x-3 pt-6 border-t">
                                    <button
                                        onClick={() => {
                                            handleBlockToggle(selectedUser._id, selectedUser.isBlocked)
                                            setShowUserDetails(false)
                                        }}
                                        className={`px-4 py-2 rounded-lg ${
                                            selectedUser.isBlocked
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-red-600 text-white hover:bg-red-700'
                                        }`}
                                    >
                                        {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleRoleChange(selectedUser._id, selectedUser.role)
                                            setShowUserDetails(false)
                                        }}
                                        className={`px-4 py-2 rounded-lg ${
                                            selectedUser.role === 'admin'
                                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                    >
                                        {selectedUser.role === 'admin' ? 'Make User' : 'Make Admin'}
                                    </button>
                                    <button
                                        onClick={() => setShowUserDetails(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserManager