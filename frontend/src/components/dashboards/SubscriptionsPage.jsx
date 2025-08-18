import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import Navbar from '../Navbar';
import { FiX } from 'react-icons/fi';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const handleEvent = (setter) => () => setter(true);
    const events = [
      ['open-profile-modal', () => setShowProfileModal(true)],
      ['open-faq-modal', () => setShowFAQModal(true)],
      ['open-contact-modal', () => setShowContactModal(true)]
    ];
    events.forEach(([e, h]) => window.addEventListener(e, h));
    return () => events.forEach(([e, h]) => window.removeEventListener(e, h));
  }, []);





  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/subscriptions/my-subscriptions", {
          headers: { Authorization: localStorage.getItem("token") }
        });
        setSubscriptions(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/subscriptions/${id}`, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setSubscriptions(subscriptions.filter(sub => sub._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting subscription");
    }
  };


  const handleSaveProfile = async () => {
    try {
      // Update in backend
      const response = await axios.put('http://localhost:5000/api/auth/update', profileData, {
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

  


  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />
      <div className="container mx-auto p-24">
        <h1 className="text-3xl font-bold mb-8">My Subscriptions</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-white p-10 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">No subscriptions found</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Subscriptions table same as before */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Actions
      </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {subscriptions.map((sub) => {
                                        const isActive = new Date() <= new Date(sub.endDate);
                                        return (
                                          <tr key={sub._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="flex items-center">
                                                <div className="ml-4">
                                                  <div className="text-sm font-medium text-gray-900">{sub.menuItem?.name || "Item not available"}</div>
                                                  <div className="text-sm text-gray-500">₹{sub.menuItem?.price || "0"}</div>
                                                </div>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="text-sm text-gray-900 capitalize">{sub.subscriptionType}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="text-sm text-gray-900">
                                                {format(new Date(sub.startDate), "MMM dd, yyyy")} - {format(new Date(sub.endDate), "MMM dd, yyyy")}
                                              </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                              }`}>
                                                {isActive ? "Active" : "Expired"}
                                              </span>
                                              </td>

                                              <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                          onClick={() => handleDelete(sub._id)}
                                                          className="text-red-600 hover:text-red-900"
                                                          title="Delete subscription"
                                                        >
                                                          <FiX size={20} />
                                                        </button>
                                                      </td>
                                            
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                    
                                  </table>

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
                                </div>
                                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;