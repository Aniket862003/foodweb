import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { format } from 'date-fns';
import { FiSearch, FiCoffee, FiDroplet, FiPieChart, FiDollarSign, FiMeh, FiHeart, FiSun, FiZap, FiAnchor, FiFeather, FiCloud, FiActivity, FiX , FiArrowLeft} from "react-icons/fi";
// import backgroundImage from './frontend/Assests/images/resbac1.jpg';
import backgroundImage from '../../Assests/images/resbac2.jpg';
import bgImage from '../../Assests/images/resbac3.jpg';


const CustomerDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [vegFilter, setVegFilter] = useState("");
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [subType, setSubType] = useState("");
  const [subDates, setSubDates] = useState({ startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') });
  const [loading, setLoading] = useState({ restaurants: false, menu: false, orders: false, subscriptions: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [activeSection, setActiveSection] = useState('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [showSubSuccess, setShowSubSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    phone: localStorage.getItem("phone") || "",
    address: localStorage.getItem("address") || "",
    role: localStorage.getItem("role") || "customer"
  });
  const [quantity, setQuantity] = useState(1); // State for quantity

  const foodCategories = [
    { name: "Snacks", icon: <FiCoffee className="text-2xl" /> }, { name: "Drinks", icon: <FiDroplet className="text-2xl" /> },
    { name: "Desserts", icon: <FiPieChart className="text-2xl" /> }, { name: "Meals", icon: <FiMeh className="text-2xl" /> },
    { name: "Vegan", icon: <FiHeart className="text-2xl" /> }, { name: "Pocket Friendly", icon: <FiDollarSign className="text-2xl" /> },
    { name: "Breakfast", icon: <FiSun className="text-2xl" /> }, { name: "Fast Food", icon: <FiZap className="text-2xl" /> },
    { name: "Seafood", icon: <FiAnchor className="text-2xl" /> }, { name: "Bakery", icon: <FiFeather className="text-2xl" /> },
    { name: "Healthy", icon: <FiActivity className="text-2xl" /> }
  ];

  useEffect(() => {
    setLoading(p => ({...p, restaurants: true}));
    axios.get("http://localhost:5000/api/restaurants")
      .then(res => { setRestaurants(res.data); setLoading(p => ({...p, restaurants: false})); })
      .catch(() => { alert("Error fetching restaurants"); setLoading(p => ({...p, restaurants: false})); });
  }, []);

  const filteredRestaurants = restaurants.filter(r => 
    (r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.cuisine.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter === "" || r.cuisine.toLowerCase().includes(categoryFilter.toLowerCase()))
  );

  const filteredMenu = menu.filter(item => 
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (priceFilter === "" || (priceFilter === "under100" && item.price < 100) || (priceFilter === "100to300" && item.price >= 100 && item.price <= 300) || (priceFilter === "over300" && item.price > 300)) &&
    (categoryFilter === "" || item.description.toLowerCase().includes(categoryFilter.toLowerCase()) || (item.category && item.category.toLowerCase().includes(categoryFilter.toLowerCase()))) &&
    (vegFilter === "" || (vegFilter === "veg" && item.isVeg) || (vegFilter === "nonveg" && !item.isVeg))
  );

  const viewMenu = (id) => {
    setLoading(p => ({...p, menu: true}));
    axios.get(`http://localhost:5000/api/restaurants/${id}/menu`)
      .then(res => { setSelectedRestaurant(id); setMenu(res.data); setLoading(p => ({...p, menu: false})); })
      .catch(() => { alert("Error fetching menu"); setLoading(p => ({...p, menu: false})); });
  };

  const addToCart = (item) => {
    setCart(cart.some(i => i._id === item._id) 
      ? cart.map(i => i._id === item._id ? {...i, quantity: i.quantity + 1} : i) 
      : [...cart, {...item, quantity: 1}]
    );
    setShowCart(true); // Show the cart when an item is added
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    setCart(cart.map(item => item._id === id ? {...item, quantity: qty} : item));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item._id !== id));

  const openSubModal = (item) => {
    setSelectedMenuItem(item);
    setShowSubModal(true);
  };

  const closeSubModal = () => {
    setShowSubModal(false);
    setSubType("");
    setSubDates({ startDate: format(new Date(), 'yyyy-MM-dd'), endDate: "" });
  };

  const calcEndDate = (start, type) => {
    const date = new Date(start);
    if (type === "Weekly") date.setDate(date.getDate() + 7);
    else if (type === "Monthly") date.setMonth(date.getMonth() + 1);
    return format(date, 'yyyy-MM-dd');
  };

  const handleSubType = (type) => {
    setSubType(type);
    setSubDates(p => ({ ...p, endDate: calcEndDate(p.startDate, type) }));
  };

  const placeSub = () => {
    if (!subDates.startDate || !subDates.endDate) return alert("Please select dates.");
    axios.post("http://localhost:5000/api/subscriptions/subscribe", {
      menuItem: selectedMenuItem._id, 
      subscriptionType: subType, 
      ...subDates
    }, { headers: { Authorization: localStorage.getItem("token") } })
      .then(res => {
        setShowSubSuccess(true);
        setTimeout(() => setShowSubSuccess(false), 3000);
        setSubscriptions([{ ...res.data.subscription, menuItem: selectedMenuItem }, ...subscriptions]);
        setShowSubModal(false);
      }).catch(() => alert("Subscription failed"));
  };

  const placeOrder = () => {
    if (cart.length === 0) return alert("Cart is empty!");
    axios.post("http://localhost:5000/api/orders/place", {
      restaurant: selectedRestaurant, 
      items: cart.map(item => ({ menuItem: item._id, quantity: item.quantity }))
    }, { headers: { Authorization: localStorage.getItem("token") } })
      .then(res => {
        setShowOrderSuccess(true);
        setTimeout(() => setShowOrderSuccess(false), 3000); // Hide after 3 seconds
        setCart([]);
        const restaurant = restaurants.find(r => r._id === selectedRestaurant);
        setOrders([{
          ...res.data.order,
          restaurant: restaurant ? { name: restaurant.name } : null,
          items: res.data.order.items.map(item => ({ ...item, menuItem: cart.find(c => c._id === item.menuItem) }))
        }, ...orders]);
      }).catch(() => alert("Order failed"));
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
    const fetchData = async () => {
      setLoading(p => ({...p, orders: true, subscriptions: true}));
      try {
        const [ordersRes, subsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/orders/my-orders", { headers: { Authorization: localStorage.getItem("token") } }),
          axios.get("http://localhost:5000/api/subscriptions/my-subscriptions", { headers: { Authorization: localStorage.getItem("token") } })
        ]);
        setOrders(ordersRes.data);
        setSubscriptions(subsRes.data);
      } catch (error) {
        console.error("Error:", error);
        alert("Error fetching data");
      } finally {
        setLoading(p => ({...p, orders: false, subscriptions: false}));
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get("http://localhost:5000/api/orders/my-orders", { headers: { Authorization: localStorage.getItem("token") } })
        .then(res => setOrders(res.data))
        .catch(() => console.log("Polling error"));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const cartTotal = cart.reduce((t, i) => t + (i.price * i.quantity), 0);

  const discountedPrice = selectedMenuItem ? (selectedMenuItem.price * 0.8).toFixed(2) : 0; // Calculate 20% discount

  if (showWelcome) return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`
      }}
      
    >
      <div className="bg-orange-50 bg-opacity-80 rounded-xl p-10 text-center max-w-2xl mx-4 shadow-xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Food Delivery!</h1>
        <p className="text-xl text-gray-600 mb-8">Discover delicious food from your favorite restaurants.</p>
        <button
          onClick={() => setShowWelcome(false)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full text-lg transition"
        >
          Explore Restaurants
        </button>
      </div>
    </div>
  );
  

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Show the cart if showCart is true */}
      {showCart ? (
        <section className="mb-8 p-6">
          {/* Back Button (top-left) */}
          <button
            onClick={() => setShowCart(false)}
            className="flex items-center text-gray-600 hover:text-gray-800 text-lg mb-6"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Cart</h2>

          {cart.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <p className="text-gray-500 text-lg">Your cart is empty</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item._id} className="p-6 flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-800">{item.name}</h4>
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          item.isVeg ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.isVeg ? "Veg" : "Non-Veg"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-4 text-lg font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-semibold text-lg text-gray-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX size={24} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
                <span className="font-semibold text-xl">Total:</span>
                <span className="font-bold text-2xl text-gray-800">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <button
                  onClick={placeOrder}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        // Render the rest of the dashboard when showCart is false
        <div>
          {/* Top half background image */}
          <div 
  className="fixed inset-0 h-full bg-cover bg-center z-0"
  style={{ backgroundImage: `url(${backgroundImage})` }}
></div>

<div className="relative z-10 bg-gradient-to-b from-transparent from-50% to-gray-100 to-50% min-h-screen">
            <Navbar />
            <div className="container mx-auto p-24">
              {/* Search and Filters */}
              <div className="mb-8">
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input type="text" placeholder="Search..." className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                <div className="mb-6 p-6 bg-orange-50 rounded-xl">
                  <h2 className="text-lg font-semibold text-orange-800 mb-3">Categories</h2>
                  <div className="flex flex-wrap gap-3">
                    {foodCategories.map((c) => (
                      <button 
                        key={c.name} 
                        onClick={() => setCategoryFilter(categoryFilter === c.name ? "" : c.name)}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-sm w-24 h-24 transition-all ${
                          categoryFilter === c.name 
                            ? "bg-orange-600 text-white shadow-md" 
                            : "bg-white hover:bg-orange-100 text-orange-900"
                        }`}
                      >
                        <div className="mb-2">{c.icon}</div>
                        <span className="text-sm">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6 p-6 bg-orange-50 rounded-xl">
                <h2 className="text-lg font-semibold text-orange-800 mb-3">Price Range</h2>
                <div className="flex flex-wrap gap-3">
                  {["under100", "100to300", "over300"].map((f) => (
                    <button 
                      key={f} 
                      onClick={() => setPriceFilter(priceFilter === f ? "" : f)}
                      className={`px-4 py-2 rounded-md shadow-sm text-sm transition-all ${
                        priceFilter === f 
                          ? "bg-orange-600 text-white shadow-md" 
                          : "bg-white hover:bg-orange-100 text-orange-900"
                      }`}
                    >
                      {f === "under100" ? "Under ₹100" : f === "100to300" ? "₹100 - ₹300" : "Over ₹300"}
                    </button>
                  ))}
                  {priceFilter && (
                    <button 
                      onClick={() => setPriceFilter("")} 
                      className="px-4 py-2 rounded-md shadow-sm text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

                <div className="mb-6 p-6 bg-orange-50 rounded-xl">
                  <h2 className="text-lg font-semibold text-orange-800 mb-3">Food Type</h2>
                  <div className="flex flex-wrap gap-3">
                    {["veg", "nonveg"].map((t) => (
                      <button 
                        key={t} 
                        onClick={() => setVegFilter(vegFilter === t ? "" : t)}
                        className={`px-4 py-2 rounded-md shadow-sm text-sm transition-all ${
                          vegFilter === t 
                            ? t === "veg" 
                              ? "bg-green-600 text-white" 
                              : "bg-red-600 text-white"
                            : "bg-white hover:bg-orange-100 text-orange-900"
                        }`}
                      >
                        {t === "veg" ? "🟢 Vegetarian" : "🔴 Non-Vegetarian"}
                      </button>
                    ))}
                    {vegFilter && (
                      <button 
                        onClick={() => setVegFilter("")} 
                        className="px-4 py-2 rounded-md shadow-sm text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 transition-all"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {!selectedRestaurant ? (
  <div className=" bg-orange-50 rounded-xl mx-[-32px] md:mx-[-px48] lg:mx-[-110px] px-10 py-10">
    <h2 className="text-2xl font-semibold text-orange-800 mb-4">Browse Restaurants</h2>
    {loading.restaurants ? (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    ) : filteredRestaurants.length === 0 ? (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <p className="text-orange-600">No restaurants found</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRestaurants.map((r) => (
          <div 
            key={r._id} 
            className="p-4 bg-white rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all hover:bg-orange-50"
            onClick={() => viewMenu(r._id)}
          >
            {r.image && <img 
              src={`http://localhost:5000/uploads/${r.image}`} 
              alt={r.name} 
              className="w-full h-40 object-cover rounded-lg mb-3"
            />}
            <h3 className="text-xl font-semibold text-orange-900">{r.name}</h3>
            <p className="text-orange-700">{r.cuisine}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-sm text-orange-600">⭐ {r.rating || 'New'}</span>
              <span className="text-sm text-orange-600">🕒 {r.deliveryTime || '30'} min</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
) : (
  <div className=" bg-orange-50 rounded-xl mx-[-32px] md:mx-[-px48] lg:mx-[-110px] px-10 py-10">
    <button 
      onClick={() => setSelectedRestaurant(null)} 
      className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition mb-4"
    >
      Back to Restaurants
    </button>

    <h2 className="text-2xl font-semibold text-orange-800 mb-4">Menu</h2>
    {loading.menu ? (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    ) : filteredMenu.length === 0 ? (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <p className="text-orange-600">No menu items found</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenu.map((m) => (
          <div
            key={m._id}
            className="p-4 bg-white shadow-sm rounded-lg hover:shadow-md transition-all flex flex-col justify-between"
          >
            {m.image ? (
              <img
                src={`http://localhost:5000/uploads/${m.image}`}
                alt={m.name}
                className="w-full h-40 object-cover rounded-lg mb-3"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
            ) : (
              <div className="w-full h-40 bg-orange-100 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-orange-600">No Image</span>
              </div>
            )}
            <div className="flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-orange-900">{m.name}</h3>
                  <p className="text-orange-700 text-sm">{m.description}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      m.isVeg
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {m.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                  </span>
                </div>
                <p className="text-orange-600 font-medium">₹{m.price}</p>
              </div>
              <div className="mt-auto flex space-x-2">
                <button
                  onClick={() => addToCart(m)}
                  className="bg-orange-600 text-white px-3 py-1 rounded-md hover:bg-orange-700 transition text-sm flex-1"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => openSubModal(m)}
                  className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition text-sm flex-1"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
 </div>

            {showSubModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">Subscribe to {selectedMenuItem?.name}</h3>
                      <button onClick={closeSubModal} className="text-gray-400 hover:text-gray-500"><FiX size={24} /></button>
                    </div>
                    <div className="space-y-4">
                      {/* Subscription Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Type</label>
                        <div className="flex space-x-2">
                          {["Weekly", "Monthly"].map((t) => (
                            <button key={t} onClick={() => handleSubType(t)}
                              className={`px-4 py-2 rounded-md text-sm font-medium ${subType === t ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <div className="flex items-center space-x-4">
                          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} // Decrease quantity, minimum 1
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">-</button>
                          <span className="text-lg font-medium">{quantity}</span>
                          <button onClick={() => setQuantity(quantity + 1)} // Increase quantity
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">+</button>
                        </div>
                      </div>

                      {/* Discounted Price */}
                      <div>
                        <p className="text-sm text-gray-600">Price per item (20% discount applied):</p>
                        <p className="text-lg font-bold text-green-600">₹{discountedPrice}</p>
                        <p className="text-sm text-gray-600">Total Price: ₹{(discountedPrice * quantity).toFixed(2)}</p>
                      </div>

                      {/* Start and End Dates */}
                      {subType && (
                        <>
                          <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input type="date" id="startDate" value={subDates.startDate} min={format(new Date(), 'yyyy-MM-dd')}
                              onChange={(e) => setSubDates({ startDate: e.target.value, endDate: calcEndDate(e.target.value, subType) })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                          </div>
                          <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input type="date" id="endDate" value={subDates.endDate} min={subDates.startDate} readOnly
                              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                          </div>
                        </>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <button onClick={closeSubModal} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button onClick={placeSub} disabled={!subType}
                          className={`px-4 py-2 rounded-md text-sm font-medium text-white ${subType ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"}`}>
                          Confirm Subscription
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
      )}
      {showOrderSuccess && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
    <div className="bg-white p-8 rounded-lg flex flex-col items-center animate-pop">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
        <svg 
          className="checkmark animate-checkmark"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 52 52"
          width="40" 
          height="40"
        >
          <circle 
            className="animate-circle"
            cx="26" 
            cy="26" 
            r="25" 
            fill="none" 
            stroke="white" 
            strokeWidth="2"
          />
          <path 
            className="animate-path"
            fill="none" 
            stroke="white" 
            strokeWidth="4" 
            strokeLinecap="round"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800">Order Placed Successfully!</h2>
      <p className="text-gray-600 mt-2">Your food is on its way!</p>
    </div>
  </div>
)}

{showSubSuccess && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
    <div className="bg-white p-8 rounded-lg flex flex-col items-center animate-pop">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
        <svg 
          className="animate-checkmark"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 52 52"
          width="40" 
          height="40"
        >
          <circle 
            className="animate-circle"
            cx="26" 
            cy="26" 
            r="25" 
            fill="none" 
            stroke="white" 
            strokeWidth="2"
          />
          <path 
            className="animate-path"
            fill="none" 
            stroke="white" 
            strokeWidth="4" 
            strokeLinecap="round"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800">Subscription Created!</h2>
      <p className="text-gray-600 mt-2">
        {subType} subscription activated until {format(new Date(subDates.endDate), "MMM do")}
      </p>
    </div>
  </div>
)}
  </div>

      
  );
};

export default CustomerDashboard;