import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { FiX, FiArrowLeft } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuData, setMenuData] = useState({ name: "", description: "", price: "", isVeg: true, image: null });
  const [restaurantData, setRestaurantData] = useState({ name: "", address: "", cuisine: "", image: null });
  const [showModal, setShowModal] = useState({ profile: false, faq: false, contact: false });
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
    fetchOrders();
    fetchRestaurants();
  }, []);


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

  const fetchOrders = () => {
    axios.get("https://foodweb-backend-g881.onrender.com/api/orders/restaurant-orders", { 
      headers: { Authorization: localStorage.getItem("token") } 
    })
    .then(res => {
      if (!res.data || res.data.length === 0) {
        console.log("No orders found for your restaurants");
      }
      setOrders(res.data);
    })
    .catch(err => {
      console.error("Order fetch error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to fetch orders");
    });
  };

  const fetchRestaurants = () => {
    axios.get("https://foodweb-backend-g881.onrender.com/api/restaurants/my-restaurants", { 
      headers: { Authorization: localStorage.getItem("token") } 
    })
    .then(res => setRestaurants(res.data))
    .catch(() => alert("Error fetching restaurants"));
  };

  const handleInputChange = (e, setter) => {
    const { name, value, files } = e.target;
    setter(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e, endpoint, data, successCallback) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => value !== null && value !== undefined && formData.append(key, value));
    try {
      const res = await axios.post(`https://foodweb-backend-g881.onrender.com/api/${endpoint}`, formData, {
        headers: { Authorization: localStorage.getItem("token"), 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message);
      successCallback(res.data);
    } catch (error) {
      alert(`Error in ${endpoint.split('/')[0]} operation`);
    }
  };

  const viewMenu = (restaurantId) => {
    setSelectedRestaurant(restaurantId);
    axios.get(`https://foodweb-backend-g881.onrender.com/api/restaurants/${restaurantId}/menu`)
      .then(res => setMenuItems(res.data))
      .catch(() => alert("Error fetching menu"));
  };

  const updateOrderStatus = (orderId, newStatus) => {
    axios.put(`https://foodweb-backend-g881.onrender.com/api/orders/update-status/${orderId}`, { status: newStatus }, 
      { headers: { Authorization: localStorage.getItem("token") } }
    ).then(fetchOrders).catch(() => alert("Error updating status"));
  };

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Accepted: "bg-blue-100 text-blue-800",
    'Out for Delivery': "bg-purple-100 text-purple-800",
    Delivered: "bg-green-100 text-green-800"
  };

  return (
    <div className="bg-orange-50 min-h-screen ">
      <Navbar />
      <div className="container mx-auto p-24">
        <AnimatePresence>
          {!selectedRestaurant ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Restaurant Dashboard</h1>
              
              {/* Order Management */}
              <motion.div className="bg-white p-6 rounded-xl shadow-lg mb-6" layout>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Order Management</h2>
                {orders.length === 0 ? (
                  <p className="text-gray-500">No orders found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map(order => (
                          <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order._id.substring(0, 8)}...</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.restaurant?.name || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer?.name || "Guest"}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              {order.status === 'Pending' && <button onClick={() => updateOrderStatus(order._id, 'Accepted')} className="text-blue-600 hover:text-blue-900">Accept</button>}
                              {order.status === 'Accepted' && <button onClick={() => updateOrderStatus(order._id, 'Out for Delivery')} className="text-purple-600 hover:text-purple-900">Dispatch</button>}
                              {order.status === 'Out for Delivery' && <button onClick={() => updateOrderStatus(order._id, 'Delivered')} className="text-green-600 hover:text-green-900">Delivered</button>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>


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

              {/* Restaurant Management */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <motion.div className="bg-white p-6 rounded-xl shadow-lg" layout>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Restaurant</h2>
                  <form onSubmit={(e) => handleSubmit(e, 'restaurants/add', restaurantData, (data) => {
                    setRestaurants([...restaurants, data.restaurant]);
                    setRestaurantData({ name: "", address: "", cuisine: "", image: null });
                  })} className="space-y-4">
                    {['name', 'address', 'cuisine'].map(field => (
                      <input key={field} type="text" name={field} value={restaurantData[field]} 
                        onChange={(e) => handleInputChange(e, setRestaurantData)} required
                        placeholder={`Restaurant ${field}`}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    ))}
                    <FileInput label="Restaurant Image" name="image" onChange={(e) => handleInputChange(e, setRestaurantData)} />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
                      Add Restaurant
                    </button>
                  </form>
                </motion.div>

                <motion.div className="bg-white p-6 rounded-xl shadow-lg" layout>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Restaurants</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurants.map(r => (
                      <motion.div 
                        key={r._id} 
                        onClick={() => viewMenu(r._id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition"
                      >
                        {r.image ? (
                          <img src={`https://foodweb-backend-g881.onrender.com/uploads/${r.image}`} alt={r.name}
                            className="w-full h-40 object-cover rounded-lg mb-3" />
                        ) : (
                          <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                          </div>
                        )}
                        <h3 className="text-xl font-semibold text-gray-800">{r.name}</h3>
                        <p className="text-gray-600">{r.cuisine}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <button 
                onClick={() => setSelectedRestaurant(null)} 
                className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition"
              >
                <FiArrowLeft className="mr-2" /> Back to Dashboard
              </button>

              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Menu Management</h2>
              <form onSubmit={(e) => handleSubmit(e, 'restaurants/add-menu', {...menuData, restaurantId: selectedRestaurant}, (data) => {
                setMenuItems([...menuItems, data.menuItem]);
                setMenuData({ name: "", description: "", price: "", isVeg: true, image: null });
              })} className="space-y-4 mb-6">
                {['name', 'description', 'price'].map(field => (
                  <input key={field} type={field === 'price' ? 'number' : 'text'} name={field}
                    value={menuData[field]} onChange={(e) => handleInputChange(e, setMenuData)}
                    required={field !== 'description'}
                    placeholder={`Menu Item ${field}`}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                ))}
                <FileInput label="Menu Item Image" name="image" onChange={(e) => handleInputChange(e, setMenuData)} />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Food Type</label>
                  <div className="flex space-x-4">
                    {['Vegetarian', 'Non-Vegetarian'].map(type => (
                      <label key={type} className="flex items-center">
                        <input type="radio" className="form-radio h-4 w-4 text-blue-600 transition"
                          checked={menuData.isVeg === (type === 'Vegetarian')}
                          onChange={() => setMenuData({...menuData, isVeg: type === 'Vegetarian'})}
                        />
                        <span className="ml-2 text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition">
                  Add Menu Item
                </button>
              </form>

              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Current Menu</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <motion.div 
                    key={item._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition"
                  >
                    {item.image && (
                      <img src={`https://foodweb-backend-g881.onrender.com/uploads/${item.image}`} alt={item.name}
                        className="w-full h-32 object-cover rounded-lg mb-3" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">₹{item.price}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FileInput = ({ label, name, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="flex items-center justify-center w-full">
      <label className="flex flex-col w-full h-32 border-2 border-dashed hover:border-gray-400 hover:bg-gray-50 transition rounded-lg cursor-pointer">
        <div className="flex flex-col items-center justify-center pt-7">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="pt-1 text-sm tracking-wider text-gray-400">Upload {label}</p>
        </div>
        <input type="file" name={name} onChange={onChange} accept="image/*" className="opacity-0" />
      </label>
    </div>
  </div>
);

export default RestaurantDashboard;
