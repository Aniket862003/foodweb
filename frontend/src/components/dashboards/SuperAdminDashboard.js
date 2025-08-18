import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { format } from 'date-fns';
import { FiX } from "react-icons/fi";

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [restaurantOrders, setRestaurantOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState({
    users: false,
    restaurants: false,
    orders: false,
    subscriptions: false,
    restaurantOrders: false
  });
const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
      name: localStorage.getItem("name") || "",
      email: localStorage.getItem("email") || "",
      phone: localStorage.getItem("phone") || "",
      address: localStorage.getItem("address") || "",
      role: localStorage.getItem("role") || "customer"
    });

  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
  }, []);

  const fetchUsers = async () => {
    setLoading(prev => ({...prev, users: true}));
    try {
      const response = await axios.get("https://foodweb-backend-g881.onrender.com/api/superadmin/users", {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(prev => ({...prev, users: false}));
    }
  };

  const fetchRestaurants = async () => {
    setLoading(prev => ({...prev, restaurants: true}));
    try {
      const response = await axios.get("https://foodweb-backend-g881.onrender.com/api/superadmin/restaurants", {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to load restaurants");
    } finally {
      setLoading(prev => ({...prev, restaurants: false}));
    }
  };

  const fetchUserDetails = async (userId) => {
    setLoading(prev => ({...prev, orders: true, subscriptions: true}));
    try {
      const [ordersRes, subsRes] = await Promise.all([
        axios.get(`https://foodweb-backend-g881.onrender.com/api/superadmin/orders/${userId}`, {
          headers: { Authorization: localStorage.getItem("token") }
        }),
        axios.get(`https://foodweb-backend-g881.onrender.com/api/superadmin/subscriptions/${userId}`, {
          headers: { Authorization: localStorage.getItem("token") }
        })
      ]);
      setUserOrders(ordersRes.data);
      setUserSubscriptions(subsRes.data);
    } catch (error) {
      console.error("Error fetching user details:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to load user details");
    } finally {
      setLoading(prev => ({...prev, orders: false, subscriptions: false}));
    }
  };

  const fetchRestaurantDetails = async (restaurantId) => {
    setLoading(prev => ({...prev, restaurantOrders: true}));
    try {
      const response = await axios.get(`https://foodweb-backend-g881.onrender.com/api/superadmin/restaurants/${restaurantId}/orders`, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setRestaurantOrders(response.data);
    } catch (error) {
      console.error("Error fetching restaurant orders:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to load restaurant orders");
    } finally {
      setLoading(prev => ({...prev, restaurantOrders: false}));
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setSelectedRestaurant(null);
    fetchUserDetails(user._id);
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setSelectedUser(null);
    fetchRestaurantDetails(restaurant._id);
  };
 useEffect(() => {
    const handleEvent = (setter) => () => setter(true);
    const events = [
      ['open-profile-modal', () => setShowProfileModal(true)],
      ['open-faq-modal', () => setShowFAQModal(true)],
      ['open-contact-modal', () => setShowContactModal(true)]
    ];
    events.forEach(([e, h]) => window.addEventListener(e, h));
    return () => events.forEach(([e, h]) => window.removeEventListener(e, h));
  }, []);


  const handleSaveProfile = async () => {
    try {
      // Update in backend
      const response = await axios.put('https://foodweb-backend-g881.onrender.com/api/auth/update', profileData, {
        headers: { Authorization: localStorage.getItem("token") }
      });
  
      // Update local storage
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("address", response.data.address);
      localStorage.setItem("phone", response.data.phone);
      localStorage.setItem("role", response.data.role);
  
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await axios.delete(`https://foodweb-backend-g881.onrender.com/api/superadmin/users/${id}`, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setUsers(users.filter(user => user._id !== id));
      if (selectedUser?._id === id) {
        setSelectedUser(null);
        setUserOrders([]);
        setUserSubscriptions([]);
      }
      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  const deleteRestaurant = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) return;
    
    try {
      await axios.delete(`https://foodweb-backend-g881.onrender.com/api/superadmin/restaurants/${id}`, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setRestaurants(restaurants.filter(restaurant => restaurant._id !== id));
      if (selectedRestaurant?._id === id) {
        setSelectedRestaurant(null);
        setRestaurantOrders([]);
      }
      alert("Restaurant deleted successfully");
    } catch (error) {
      console.error("Error deleting restaurant:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to delete restaurant");
    }
  };

  // Filter users by role
  const customers = users.filter(user => user.role === 'Customer');
  const restaurantAdmins = users.filter(user => user.role === 'Restaurant Admin');
  const superAdmins = users.filter(user => user.role === 'Super Admin');

  // Filter by search term
  const filteredCustomers = customers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredRestaurantAdmins = restaurantAdmins.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredSuperAdmins = superAdmins.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date properly
  const formatDate = (dateString) => {
    try {
      return dateString ? format(new Date(dateString), 'MMM dd, yyyy hh:mm a') : 'N/A';
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-orange-50 min-h-screen ">
      <Navbar />
      <div className="container mx-auto p-24 ">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg shadow-lg p-6 sticky top-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Navigation</h2>
            <div className="space-y-4">
              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'customers'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg'
                    : 'hover:bg-gray-100'
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => setActiveTab('restaurantAdmins')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'restaurantAdmins'
                    ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg'
                    : 'hover:bg-gray-100'
                }`}
              >
                Restaurant Admins
              </button>
              <button
                onClick={() => setActiveTab('superAdmins')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'superAdmins'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg'
                    : 'hover:bg-gray-100'
                }`}
              >
                Super Admins
              </button>
              <button
                onClick={() => setActiveTab('restaurants')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'restaurants'
                    ? 'bg-gradient-to-r from-red-700 to-red-900 text-white shadow-lg'
                    : 'hover:bg-gray-100'
                }`}
              >
                Restaurants
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg shadow-lg">
                <p className="text-blue-700 font-medium">Total Users</p>
                <h3 className="text-3xl font-bold">{users.length}</h3>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-green-200 p-6 rounded-lg shadow-lg">
                <p className="text-green-700 font-medium">Total Restaurants</p>
                <h3 className="text-3xl font-bold">{restaurants.length}</h3>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-6 rounded-lg shadow-lg">
                <p className="text-purple-700 font-medium">Active Orders</p>
                <h3 className="text-3xl font-bold">
                  {[...userOrders, ...restaurantOrders].filter(order => order.status === 'Pending').length}
                </h3>
              </div>
            </div>

            {/* Users/Restaurants List */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody>

                      {showProfileModal && (
                                                                                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                                                                                  <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn">
                                                                                    {/* Header */}
                                                                                    <button
                                                                                      onClick={() => {
                                                                                        setShowProfileModal(false);
                                                                                        setIsEditing(false);
                                                                                      }}
                                                                                      className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
                                                                                    >
                                                                                      <FiX size={24} />
                                                                                    </button>
                                                                  
                                                                                    {/* Profile Card */}
                                                                                    <div className="flex flex-col items-center text-center">
                                                                                      {/* Profile Image Placeholder */}
                                                                                      <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 shadow-md flex items-center justify-center text-gray-500 text-4xl">
                                                                                        <span>{profileData.name?.[0]?.toUpperCase()}</span>
                                                                                      </div>
                                                                  
                                                                                      <h2 className="text-2xl font-semibold">{profileData.name}</h2>
                                                                                      <p className="text-gray-500">{profileData.email}</p>
                                                                                      <p className="text-gray-500">{profileData.phone || "No phone number provided"}</p>
                                                                                      <p className="text-gray-500">{profileData.address || "No address provided"}</p> 
                                                                                      <p className="mt-1 text-sm text-gray-400 capitalize">{profileData.role}</p>
                                                                                    </div>
                                                                  
                                                                                    {/* Editable Fields */}
                                                                                    <div className="mt-6 space-y-4 text-left">
                                                                                      {/* Name */}
                                                                                      <div>
                                                                                        <label className="text-gray-600 font-medium">Name:</label>
                                                                                        {isEditing ? (
                                                                                          <input
                                                                                            type="text"
                                                                                            value={profileData.name}
                                                                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                                                            className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                                                                                          />
                                                                                        ) : (
                                                                                          <p className="mt-1 text-gray-800">{profileData.name}</p>
                                                                                        )}
                                                                                      </div>
                                                                  
                                                                                      {/* Email */}
                                                                                      <div>
                                                                                        <label className="text-gray-600 font-medium">Email:</label>
                                                                                        {isEditing ? (
                                                                                          <input
                                                                                            type="email"
                                                                                            value={profileData.email}
                                                                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                                                            className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                                                                                          />
                                                                                        ) : (
                                                                                          <p className="mt-1 text-gray-800">{profileData.email}</p>
                                                                                        )}
                                                                                      </div>
                                                                  
                                                                                      <div>
                                                                                        <label className="text-gray-600 font-medium">phone:</label>
                                                                                        {isEditing ? (
                                                                                          <input
                                                                                            type="phone"
                                                                                            value={profileData.phone}
                                                                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                                                            className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                                                                                          />
                                                                                        ) : (
                                                                                          <p className="mt-1 text-gray-800">{profileData.phone}</p>
                                                                                        )}
                                                                                      </div>
                                                                  
                                                                  
                                                                  
                                                                                      {/* Address */}
                                                                                      <div>
                                                                                        <label className="text-gray-600 font-medium">Address:</label>
                                                                                        {isEditing ? (
                                                                                          <textarea
                                                                                            value={profileData.address}
                                                                                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                                                            className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                                                                                            rows="3"
                                                                                          />
                                                                                        ) : (
                                                                                          <p className="mt-1 text-gray-800">
                                                                                            {profileData.address || "No address provided"}
                                                                                          </p>
                                                                                        )}
                                                                                      </div>
                                                                                    </div>
                                                                  
                                                                                    {/* Action Buttons */}
                                                                                    <div className="flex justify-end gap-3 mt-6">
                                                                                      {isEditing ? (
                                                                                        <>
                                                                                          <button
                                                                                            onClick={handleSaveProfile}
                                                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                                                          >
                                                                                            Save
                                                                                          </button>
                                                                                          <button
                                                                                            onClick={() => setIsEditing(false)}
                                                                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                                                                          >
                                                                                            Cancel
                                                                                          </button>
                                                                                        </>
                                                                                      ) : (
                                                                                        <button
                                                                                          onClick={() => setIsEditing(true)}
                                                                                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                                                                        >
                                                                                          Edit Profile
                                                                                        </button>
                                                                                      )}
                                                                                    </div>
                                                                                  </div>
                                                                                </div>
                                                                              )}
                                                                              {showFAQModal && (
                                                                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                                                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                                                                    <div className="flex justify-between items-center mb-4">
                                                                                      <h3 className="text-xl font-bold">Help & FAQs</h3>
                                                                                      <button onClick={() => setShowFAQModal(false)} className="text-gray-500 hover:text-gray-700"><FiX size={24} /></button>
                                                                                    </div>
                                                                                    <div className="space-y-4">
                                                                                      <div><h4 className="font-semibold">How do I place an order?</h4><p className="text-gray-600">Select items and click "Add to Cart", then checkout.</p></div>
                                                                                      <div><h4 className="font-semibold">Can I cancel my order?</h4><p className="text-gray-600">Orders can be cancelled within 5 minutes.</p></div>
                                                                                    </div>
                                                                                  </div>
                                                                                </div>
                                                                              )}
                                                                  
                                                                              {showContactModal && (
                                                                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                                                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                                                                    <div className="flex justify-between items-center mb-4">
                                                                                      <h3 className="text-xl font-bold">Contact Us</h3>
                                                                                      <button onClick={() => setShowContactModal(false)} className="text-gray-500 hover:text-gray-700"><FiX size={24} /></button>
                                                                                    </div>
                                                                                    <div className="space-y-4">
                                                                                      <p className="text-gray-600">Email: support@fooddelivery.com</p>
                                                                                      <p className="text-gray-600">Phone: +1 (123) 456-7890</p>
                                                                                      <p className="text-gray-600">Address: 123 Food Street, City, Country</p>
                                                                                    </div>
                                                                                  </div>
                                                                                </div>
                                                                              )}
                      
                                {/* Main Content */}
                                <div className="lg:col-span-3 space-y-6">
                                  {/* Users/Restaurants List */}
                                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                    {loading.users || loading.restaurants ? (
                                      <div className="flex justify-center items-center h-40">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                      </div>
                                    ) : (
                                      <>
                                        {activeTab === 'customers' && (
                                          <div>
                                            <div className="p-4 border-b">
                                              <h2 className="text-xl font-semibold text-gray-700">Customers</h2>
                                              <p className="text-sm text-gray-500">{filteredCustomers.length} customers found</p>
                                            </div>
                                            <div className="overflow-x-auto">
                                              <table className="w-full">
                                                <thead>
                                                  <tr className="bg-gradient-to-r from-gray-500 to-gray-700 text-white shadow-lg ">
                                                    <th className="p-3 text-left">Name</th>
                                                    <th className="p-3 text-left">Email</th>
                                                    <th className="p-3 text-left">Joined</th>
                                                    <th className="p-3 text-left">Action</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {filteredCustomers.map((user) => (
                                                    <tr 
                                                      key={user._id} 
                                                      className={`border-t hover:bg-gray-50 ${selectedUser?._id === user._id ? 'bg-blue-50' : ''}`}
                                                      onClick={() => handleUserClick(user)}
                                                    >
                                                      <td className="p-3">{user.name}</td>
                                                      <td className="p-3">{user.email}</td>
                                                      <td className="p-3">{formatDate(user.createdAt)}</td>
                                                      <td className="p-3">
                                                        <button 
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteUser(user._id);
                                                          }} 
                                                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
                                                        >
                                                          Delete
                                                        </button>
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        )}
                      
                                        {activeTab === 'restaurantAdmins' && (
                                          <div>
                                            <div className="p-4 border-b">
                                              <h2 className="text-xl font-semibold text-gray-700">Restaurant Admins</h2>
                                              <p className="text-sm text-gray-500">{filteredRestaurantAdmins.length} admins found</p>
                                            </div>
                                            <div className="overflow-x-auto">
                                              <table className="w-full">
                                                <thead>
                                                  <tr className="bg-gradient-to-r from-gray-500 to-gray-700 text-white shadow-lg">
                                                    <th className="p-3 text-left">Name</th>
                                                    <th className="p-3 text-left">Email</th>
                                                    <th className="p-3 text-left">Joined</th>
                                                    <th className="p-3 text-left">Action</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {filteredRestaurantAdmins.map((user) => (
                                                    <tr 
                                                      key={user._id} 
                                                      className={`border-t hover:bg-gray-50 ${selectedUser?._id === user._id ? 'bg-blue-50' : ''}`}
                                                      onClick={() => handleUserClick(user)}
                                                    >
                                                      <td className="p-3">{user.name}</td>
                                                      <td className="p-3">{user.email}</td>
                                                      <td className="p-3">{formatDate(user.createdAt)}</td>
                                                      <td className="p-3">
                                                        <button 
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteUser(user._id);
                                                          }} 
                                                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
                                                        >
                                                          Delete
                                                        </button>
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        )}
                      
                                        {activeTab === 'superAdmins' && (
                                          <div>
                                            <div className="p-4 border-b">
                                              <h2 className="text-xl font-semibold text-gray-700">Super Admins</h2>
                                              <p className="text-sm text-gray-500">{filteredSuperAdmins.length} super admins found</p>
                                            </div>
                                            <div className="overflow-x-auto">
                                              <table className="w-full">
                                                <thead>
                                                  <tr className="bg-gradient-to-r from-gray-500 to-gray-700 text-white shadow-lg">
                                                    <th className="p-3 text-left">Name</th>
                                                    <th className="p-3 text-left">Email</th>
                                                    <th className="p-3 text-left">Joined</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {filteredSuperAdmins.map((user) => (
                                                    <tr 
                                                      key={user._id} 
                                                      className="border-t hover:bg-gray-50"
                                                    >
                                                      <td className="p-3">{user.name}</td>
                                                      <td className="p-3">{user.email}</td>
                                                      <td className="p-3">{formatDate(user.createdAt)}</td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        )}
                      
                                        {activeTab === 'restaurants' && (
                                          <div>
                                            <div className="p-4 border-b">
                                              <h2 className="text-xl font-semibold text-gray-700">Restaurants</h2>
                                              <p className="text-sm text-gray-500">{filteredRestaurants.length} restaurants found</p>
                                            </div>
                                            <div className="overflow-x-auto">
                                              <table className="w-full">
                                                <thead>
                                                  <tr className="bg-gradient-to-r from-gray-500 to-gray-700 text-white shadow-lg ">
                                                    <th className="p-3 text-left">Name</th>
                                                    <th className="p-3 text-left">Cuisine</th>
                                                    <th className="p-3 text-left">Created</th>
                                                    <th className="p-3 text-left">Action</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {filteredRestaurants.map((restaurant) => (
                                                    <tr 
                                                      key={restaurant._id} 
                                                      className={`border-t hover:bg-gray-50 ${selectedRestaurant?._id === restaurant._id ? 'bg-blue-50' : ''}`}
                                                      onClick={() => handleRestaurantClick(restaurant)}
                                                    >
                                                      <td className="p-3">{restaurant.name}</td>
                                                      <td className="p-3 capitalize">{restaurant.cuisine}</td>
                                                      <td className="p-3">{formatDate(restaurant.createdAt)}</td>
                                                      <td className="p-3">
                                                        <button 
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteRestaurant(restaurant._id);
                                                          }} 
                                                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
                                                        >
                                                          Delete
                                                        </button>
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                      
                                  {/* Details Panel */}
                                  {(selectedUser || selectedRestaurant) && (
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                      {selectedUser && (
                                        <>
                                          <div className="mb-6">
                                            <h2 className="text-xl font-semibold mb-2">{selectedUser.name}'s Profile</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium">{selectedUser.email}</p>
                                              </div>
                                              <div>
                                                <p className="text-sm text-gray-500">Role</p>
                                                <p className="font-medium capitalize">{selectedUser.role}</p>
                                              </div>
                                              <div>
                                                <p className="text-sm text-gray-500">Account Created</p>
                                                <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                                              </div>
                                              <div>
                                                <p className="text-sm text-gray-500">Last Updated</p>
                                                <p className="font-medium">{formatDate(selectedUser.updatedAt)}</p>
                                              </div>
                                            </div>
                                          </div>
                      
                                          <div className="mb-6">
                                            <div className="flex justify-between items-center mb-4">
                                              <h2 className="text-xl font-semibold">Order History</h2>
                                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                {userOrders.length} orders
                                              </span>
                                            </div>
                                            {loading.orders ? (
                                              <div className="flex justify-center items-center h-40">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                              </div>
                                            ) : userOrders.length > 0 ? (
                                              <div className="overflow-x-auto">
                                                <table className="w-full">
                                                  <thead>
                                                    <tr className="bg-gray-100">
                                                      <th className="p-2 text-left">Order ID</th>
                                                      <th className="p-2 text-left">Restaurant</th>
                                                      <th className="p-2 text-left">Items</th>
                                                      <th className="p-2 text-left">Total</th>
                                                      <th className="p-2 text-left">Status</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {userOrders.map((order) => (
                                                      <tr key={order._id} className="border-t">
                                                        <td className="p-2">{order._id.substring(0, 8)}...</td>
                                                        <td className="p-2">{order.restaurant?.name || 'N/A'}</td>
                                                        <td className="p-2">
                                                          {order.items.map(item => item.menuItem?.name).filter(Boolean).join(', ')}
                                                        </td>
                                                        <td className="p-2">
                                                          ₹{order.items.reduce((total, item) => total + (item.menuItem?.price || 0) * item.quantity, 0).toFixed(2)}
                                                        </td>
                                                        <td className="p-2">
                                                          <span className={`px-2 py-1 rounded-full text-xs ${
                                                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                            'bg-blue-100 text-blue-800'
                                                          }`}>
                                                            {order.status}
                                                          </span>
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            ) : (
                                              <div className="text-center py-8 text-gray-500">
                                                No orders found for this user
                                              </div>
                                            )}
                                          </div>
                      
                                          <div>
                                            <div className="flex justify-between items-center mb-4">
                                              <h2 className="text-xl font-semibold">Subscriptions</h2>
                                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                                {userSubscriptions.length} subscriptions
                                              </span>
                                            </div>
                                            {loading.subscriptions ? (
                                              <div className="flex justify-center items-center h-40">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                              </div>
                                            ) : userSubscriptions.length > 0 ? (
                                              <div className="overflow-x-auto">
                                                <table className="w-full">
                                                  <thead>
                                                    <tr className="bg-gray-100">
                                                      <th className="p-2 text-left">Item</th>
                                                      <th className="p-2 text-left">Type</th>
                                                      <th className="p-2 text-left">Period</th>
                                                      <th className="p-2 text-left">Status</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {userSubscriptions.map((sub) => {
                                                      const isActive = new Date(sub.endDate) > new Date();
                                                      return (
                                                        <tr key={sub._id} className="border-t">
                                                          <td className="p-2">{sub.menuItem?.name || 'N/A'}</td>
                                                          <td className="p-2 capitalize">{sub.subscriptionType}</td>
                                                          <td className="p-2">
                                                            {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                                                          </td>
                                                          <td className="p-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                              isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                              {isActive ? 'Active' : 'Expired'}
                                                            </span>
                                                          </td>
                                                        </tr>
                                                      );
                                                    })}
                                                  </tbody>
                                                </table>
                                              </div>
                                            ) : (
                                              <div className="text-center py-8 text-gray-500">
                                                No subscriptions found for this user
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      )}
                      
                                      {selectedRestaurant && (
                                        <>
                                          <div className="mb-6">
                                            <h2 className="text-xl font-semibold mb-2">{selectedRestaurant.name}</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                <p className="text-sm text-gray-500">Cuisine</p>
                                                <p className="font-medium capitalize">{selectedRestaurant.cuisine}</p>
                                              </div>
                                              <div>
                                                <p className="text-sm text-gray-500">Address</p>
                                                <p className="font-medium">{selectedRestaurant.address || 'N/A'}</p>
                                              </div>
                                              <div>
                                                <p className="text-sm text-gray-500">Created</p>
                                                <p className="font-medium">{formatDate(selectedRestaurant.createdAt)}</p>
                                              </div>
                                              <div>
                                                <p className="text-sm text-gray-500">Last Updated</p>
                                                <p className="font-medium">{formatDate(selectedRestaurant.updatedAt)}</p>
                                              </div>
                                            </div>
                                          </div>
                      
                                          <div>
                                            <div className="flex justify-between items-center mb-4">
                                              <h2 className="text-xl font-semibold">Recent Orders</h2>
                                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                {restaurantOrders.length} orders
                                              </span>
                                            </div>
                                            {loading.restaurantOrders ? (
                                              <div className="flex justify-center items-center h-40">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                              </div>
                                            ) : restaurantOrders.length > 0 ? (
                                              <div className="overflow-x-auto">
                                                <table className="w-full">
                                                  <thead>
                                                    <tr className="bg-gray-100">
                                                      <th className="p-2 text-left">Order ID</th>
                                                      <th className="p-2 text-left">Customer</th>
                                                      <th className="p-2 text-left">Items</th>
                                                      <th className="p-2 text-left">Total</th>
                                                      <th className="p-2 text-left">Status</th>
                                                      <th className="p-2 text-left">Date</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {restaurantOrders.map((order) => (
                                                      <tr key={order._id} className="border-t">
                                                        <td className="p-2">{order._id.substring(0, 8)}...</td>
                                                        <td className="p-2">{order.customer?.name || 'N/A'}</td>
                                                        <td className="p-2">
                                                          {order.items.map(item => item.menuItem?.name).filter(Boolean).join(', ')}
                                                        </td>
                                                        <td className="p-2">
                                                          ₹{order.items.reduce((total, item) => total + (item.menuItem?.price || 0) * item.quantity, 0).toFixed(2)}
                                                        </td>
                                                        <td className="p-2">
                                                          <span className={`px-2 py-1 rounded-full text-xs ${
                                                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                            'bg-blue-100 text-blue-800'
                                                          }`}>
                                                            {order.status}
                                                          </span>
                                                        </td>
                                                        <td className="p-2">{formatDate(order.timestamp)}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            ) : (
                                              <div className="text-center py-8 text-gray-500">
                                                No orders found for this restaurant
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                    {/* Repeat similar structure for other tabs */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
