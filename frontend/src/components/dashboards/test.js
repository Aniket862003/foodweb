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
    axios.get("https://foodweb-backend-g881.onrender.com/api/restaurants")
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
    axios.get(`https://foodweb-backend-g881.onrender.com/api/restaurants/${id}/menu`)
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
    axios.post("https://foodweb-backend-g881.onrender.com/api/subscriptions/subscribe", {
      menuItem: selectedMenuItem._id, subscriptionType: subType, ...subDates
    }, { headers: { Authorization: localStorage.getItem("token") } })
      .then(res => {
        alert("Subscription added!");
        setSubscriptions([{ ...res.data.subscription, menuItem: selectedMenuItem }, ...subscriptions]);
        setShowSubModal(false);
      }).catch(() => alert("Subscription failed"));
  };

  const placeOrder = () => {
    if (cart.length === 0) return alert("Cart is empty!");
    axios.post("https://foodweb-backend-g881.onrender.com/api/orders/place", {
      restaurant: selectedRestaurant, items: cart.map(item => ({ menuItem: item._id, quantity: item.quantity }))
    }, { headers: { Authorization: localStorage.getItem("token") } })
      .then(res => {
        alert("Order placed!");
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
          axios.get("https://foodweb-backend-g881.onrender.com/api/orders/my-orders", { headers: { Authorization: localStorage.getItem("token") } }),
          axios.get("https://foodweb-backend-g881.onrender.com/api/subscriptions/my-subscriptions", { headers: { Authorization: localStorage.getItem("token") } })
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
      axios.get("https://foodweb-backend-g881.onrender.com/api/orders/my-orders", { headers: { Authorization: localStorage.getItem("token") } })
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
      <div className="bg-white bg-opacity-80 rounded-xl p-10 text-center max-w-2xl mx-4 shadow-xl">
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
    <div className="min-h-screen">
      {/* Show the cart if showCart is true */}
      {showCart ? (
  <section className="mb-8 relative">
    {/* Back Button (top-left) */}
    <button
      onClick={() => setShowCart(false)}
      className="absolute left-0 top-0 mt-2 ml-4 flex items-center text-gray-600 hover:text-gray-800 text-lg"
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
            className="fixed inset-x-0 top-10 h-1/2 bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          ></div>

          <div className="relative z-10 bg-gradient-to-b from-transparent from-50% to-gray-100 to-50% min-h-screen">
            <Navbar />
            <div className="container mx-auto p-24">
             

              <div className="mb-8">
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input type="text" placeholder="Search..." className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Categories</h2>
                  <div className="flex flex-wrap gap-3">
                    {foodCategories.map((c) => (
                      <button key={c.name} onClick={() => setCategoryFilter(categoryFilter === c.name ? "" : c.name)}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-sm w-24 h-24 transition ${categoryFilter === c.name ? "bg-yellow-500 text-white" : "bg-white hover:bg-gray-50"}`}>
                        <div className="mb-2">{c.icon}</div>
                        <span className="text-sm">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Price Range</h2>
                  <div className="flex flex-wrap gap-3">
                    {["under100", "100to300", "over300"].map((f) => (
                      <button key={f} onClick={() => setPriceFilter(priceFilter === f ? "" : f)}
                        className={`px-4 py-2 rounded-md shadow-sm text-sm ${priceFilter === f ? "bg-yellow-500 text-white" : "bg-white hover:bg-gray-50"}`}>
                        {f === "under100" ? "Under ₹100" : f === "100to300" ? "₹100 - ₹300" : "Over ₹300"}
                      </button>
                    ))}
                    {priceFilter && <button onClick={() => setPriceFilter("")} className="px-4 py-2 rounded-md shadow-sm text-sm bg-gray-100 hover:bg-gray-200">Clear</button>}
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Food Type</h2>
                  <div className="flex flex-wrap gap-3">
                    {["veg", "nonveg"].map((t) => (
                      <button key={t} onClick={() => setVegFilter(vegFilter === t ? "" : t)}
                        className={`px-4 py-2 rounded-md shadow-sm text-sm ${vegFilter === t ? t === "veg" ? "bg-green-500 text-white" : "bg-red-500 text-white" : "bg-white hover:bg-gray-50"}`}>
                        {t === "veg" ? "🟢 Vegetarian" : "🔴 Non-Vegetarian"}
                      </button>
                    ))}
                    {vegFilter && <button onClick={() => setVegFilter("")} className="px-4 py-2 rounded-md shadow-sm text-sm bg-gray-100 hover:bg-gray-200">Clear</button>}
                  </div>
                </div>
              </div>

              {!selectedRestaurant ? (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Browse Restaurants</h2>
                  {loading.restaurants ? (
                    <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>
                  ) : filteredRestaurants.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm text-center"><p className="text-gray-500">No restaurants found</p></div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredRestaurants.map((r) => (
                        <div key={r._id} className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition" onClick={() => viewMenu(r._id)}>
                          {r.image && <img src={`https://foodweb-backend-g881.onrender.com/uploads/${r.image}`} alt={r.name} className="w-full h-40 object-cover rounded-lg mb-3" />}
                          <h3 className="text-xl font-semibold text-gray-800">{r.name}</h3>
                          <p className="text-gray-600">{r.cuisine}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-sm text-gray-500">⭐ {r.rating || 'New'}</span>
                            <span className="text-sm text-gray-500">🕒 {r.deliveryTime || '30'} min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={() => setSelectedRestaurant(null)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition mb-4">
                    Back to Restaurants
                  </button>

                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Menu</h2>
{loading.menu ? (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
) : filteredMenu.length === 0 ? (
  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
    <p className="text-gray-500">No menu items found</p>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {filteredMenu.map((m) => (
      <div
        key={m._id}
        className="p-4 bg-white shadow rounded-lg hover:shadow-md transition flex flex-col justify-between"
      >
        {m.image ? (
          <img
            src={`https://foodweb-backend-g881.onrender.com/uploads/${m.image}`}
            alt={m.name}
            className="w-full h-40 object-cover rounded-lg mb-3"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/300x200?text=No+Image";
            }}
          />
        ) : (
          <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold">{m.name}</h3>
              <p className="text-gray-600 text-sm">{m.description}</p>
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
            <p className="text-yellow-600 font-medium">₹{m.price}</p>
          </div>
          <div className="mt-auto flex space-x-2">
            <button
              onClick={() => addToCart(m)}
              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition text-sm flex-1"
            >
              Add to Cart
            </button>
            <button
              onClick={() => openSubModal(m)}
              className="bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition text-sm flex-1"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
                
                </>
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

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Cart</h2>
              {cart.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center"><p className="text-gray-500">Your cart is empty</p></div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <div key={item._id} className="p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${item.isVeg ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {item.isVeg ? "Veg" : "Non-Veg"}
                          </span>

                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center border rounded-md">
                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100">-</button>
                            <span className="px-2">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100">+</button>
                          </div>
                          <span className="font-medium w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                          <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700"><FiX size={20} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="p-4">
                    <button onClick={placeOrder} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition">Place Order</button>
                  </div>
                </div>
              )}
            </section>

            {/* Add the toggle buttons here */}
            <div className="flex mb-4 border-b border-gray-200">
              <button 
                onClick={() => setActiveSection('orders')}
                className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeSection === 'orders' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Orders
              </button>
              <button 
                onClick={() => setActiveSection('subscriptions')}
                className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeSection === 'subscriptions' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Subscriptions
              </button>
            </div>
            <div className="p-6">
            {activeSection === "subscriptions" && (
              <section id="subscriptions-section" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Subscriptions</h2>

                {loading.subscriptions ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <p className="text-gray-500">No subscriptions yet</p>
                  </div>
                ) : (
                  <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeSection === 'orders' && (
              <section id="orders-section" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Orders</h2>
                {loading.orders ? (
                  <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>
                ) : orders.length === 0 ? (
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center"><p className="text-gray-500">No orders yet</p></div>
                ) : (
                  <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => {
                            const total = order.items.reduce((t, i) => t + (i.menuItem?.price || 0) * i.quantity, 0);
                            return (
                              <tr key={order._id}>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{order.restaurant?.name || "Restaurant not available"}</div></td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 space-y-1">
                                    {order.items.map((item, i) => (
                                      <div key={i} className="flex justify-between">
                                        <span>{item.menuItem?.name || "Item not available"} × {item.quantity}</span>
                                        <span className="text-gray-600 ml-4">₹{(item.menuItem?.price || 0) * item.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₹{total.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(order.timestamp), 'MMM dd, yyyy')}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    order.status.toLowerCase().includes('cancel') ? "bg-red-100 text-red-800" :
                                    order.status.toLowerCase().includes('deliver') ? "bg-green-100 text-green-800" :
                                    "bg-yellow-100 text-yellow-800"
                                  }`}>{order.status}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                )}
              </section>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;




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

  useEffect(() => {
    fetchOrders();
    fetchRestaurants();
  }, []);

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


--------------------------------------------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { FiX } from "react-icons/fi";

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [restaurantData, setRestaurantData] = useState({ 
    name: "", 
    address: "", 
    cuisine: "", 
    image: null 
  });
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuData, setMenuData] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    isVeg: true,
    image: null,
    
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  

  // Fetch orders and restaurants on component mount
  useEffect(() => {
    fetchOrders();
    fetchRestaurants();
  }, []);

  const fetchOrders = () => {
    axios
      .get("https://foodweb-backend-g881.onrender.com/api/orders/restaurant-orders", { 
        headers: { Authorization: localStorage.getItem("token") } 
      })
      .then((res) => setOrders(res.data))
      .catch(() => alert("Error fetching orders"));

      
  };

  const fetchRestaurants = () => {
    axios
      .get("https://foodweb-backend-g881.onrender.com/api/restaurants/my-restaurants", { 
        headers: { Authorization: localStorage.getItem("token") } 
      })
      .then((res) => setRestaurants(res.data))
      .catch(() => alert("Error fetching your restaurants"));
  };

  const handleChange = (e) => {
    setRestaurantData({ ...restaurantData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setRestaurantData({ ...restaurantData, image: e.target.files[0] });
  };

  const handleMenuImageChange = (e) => {
    setMenuData({ ...menuData, image: e.target.files[0] });
  };

  const addRestaurant = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', restaurantData.name);
    formData.append('address', restaurantData.address);
    formData.append('cuisine', restaurantData.cuisine);
    if (restaurantData.image) {
      formData.append('image', restaurantData.image);
    }

    axios.post(
      "https://foodweb-backend-g881.onrender.com/api/restaurants/add",
      formData,
      { 
        headers: { 
          Authorization: localStorage.getItem("token"),
          'Content-Type': 'multipart/form-data'
        } 
      }
    ).then((res) => {
      alert(res.data.message);
      setRestaurants([...restaurants, res.data.restaurant]);
      setRestaurantData({ name: "", address: "", cuisine: "", image: null });
    }).catch(() => alert("Error adding restaurant"));
  };

  const viewMenu = (restaurantId) => {
    setSelectedRestaurant(restaurantId);
    axios.get(`http://localhost:5000/api/restaurants/${restaurantId}/menu`)
      .then((res) => setMenuItems(res.data))
      .catch(() => alert("Error fetching menu items"));
  };

  const handleMenuChange = (e) => {
    setMenuData({ ...menuData, [e.target.name]: e.target.value });
  };

  const addMenuItem = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', menuData.name);
    formData.append('description', menuData.description);
    formData.append('price', menuData.price);
    formData.append('restaurantId', selectedRestaurant);
    if (menuData.image) {
      formData.append('image', menuData.image);
    }

    axios.post(
      "http://localhost:5000/api/restaurants/add-menu",
      formData,
      { 
        headers: { 
          Authorization: localStorage.getItem("token"),
          'Content-Type': 'multipart/form-data'
        } 
      }
    ).then((res) => {
      alert(res.data.message);
      setMenuItems([...menuItems, res.data.menuItem]);
      setMenuData({ name: "", description: "", price: "", image: null });
    }).catch(() => alert("Error adding menu item"));
  };

  // Function to update order status
  const updateOrderStatus = (orderId, newStatus) => {
    axios.put(
      `http://localhost:5000/api/orders/update-status/${orderId}`,
      { status: newStatus },
      { headers: { Authorization: localStorage.getItem("token") } }
    ).then(() => {
      fetchOrders(); // Refresh orders after status update
    }).catch(() => alert("Error updating order status"));
  };

  useEffect(() => {
    const handleProfileModal = () => setShowProfileModal(true);
    const handleFAQModal = () => setShowFAQModal(true);
    const handleContactModal = () => setShowContactModal(true);
  
    window.addEventListener('open-profile-modal', handleProfileModal);
    window.addEventListener('open-faq-modal', handleFAQModal);
    window.addEventListener('open-contact-modal', handleContactModal);
  
    return () => {
      window.removeEventListener('open-profile-modal', handleProfileModal);
      window.removeEventListener('open-faq-modal', handleFAQModal);
      window.removeEventListener('open-contact-modal', handleContactModal);
    };
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-24">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Restaurant Admin Dashboard</h1>

        {/* Order Management Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Order Management</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order._id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer?.name || "Guest"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index}>
                              {item.menuItem?.name || "Item not available"} × {item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Pending' ? "bg-yellow-100 text-yellow-800" :
                          order.status === 'Accepted' ? "bg-blue-100 text-blue-800" :
                          order.status === 'Out for Delivery' ? "bg-purple-100 text-purple-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.status === 'Pending' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'Accepted')}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Accept
                          </button>
                        )}
                        {order.status === 'Accepted' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'Out for Delivery')}
                            className="text-purple-600 hover:text-purple-900 mr-3"
                          >
                            Out for Delivery
                          </button>
                        )}
                        {order.status === 'Out for Delivery' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'Delivered')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark as Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add a New Restaurant</h2>
          <form onSubmit={addRestaurant} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Restaurant Name"
              value={restaurantData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={restaurantData.address}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="cuisine"
              placeholder="Cuisine Type"
              value={restaurantData.cuisine}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Image</label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Add Restaurant
            </button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Restaurants</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => viewMenu(r._id)}
                    className="p-4 bg-white shadow rounded-lg cursor-pointer hover:shadow-md transition"
                  >
                    {r.image ? (
                      <img 
                        src={`https://foodweb-backend-g881.onrender.com/uploads/${r.image}`}
                        alt={r.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold">{r.name}</h3>
                    <p className="text-gray-600">{r.cuisine}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-500">{r.address}</span>
                      <span className="text-sm text-gray-500">🕒 {r.deliveryTime || '30'} min</span>
                      <span className="text-sm bg-red-400 bo text-gray-500"> Bestseller</span>

                    </div>
                  </div>
                ))}
              </div>
            </div>
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">My Profile</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Username:</p>
                  <p className="font-medium">{localStorage.getItem("name") || "User"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email:</p>
                  <p className="font-medium">{localStorage.getItem("email") || "No email available"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Account Type:</p>
                  <p className="font-medium capitalize">{localStorage.getItem("role") || "Customer"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {showFAQModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Help & FAQs</h3>
                <button onClick={() => setShowFAQModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">How do I place an order?</h4>
                  <p className="text-gray-600">Select items from the menu and click "Add to Cart", then proceed to checkout.</p>
                </div>
                <div>
                  <h4 className="font-semibold">Can I cancel my order?</h4>
                  <p className="text-gray-600">Orders can be cancelled within 5 minutes of placement.</p>
                </div>
              </div>
            </div>
          </div>
        )} 
        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Contact Us</h3>
                <button onClick={() => setShowContactModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">Email: support@fooddelivery.com</p>
                <p className="text-gray-600">Phone: +1 (123) 456-7890</p>
                <p className="text-gray-600">Address: 123 Food Street, City, Country</p>
              </div>
            </div>
          </div>
        )}
        {selectedRestaurant && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Menu Item</h2>
            <form onSubmit={addMenuItem} className="space-y-4 mb-6">
              <input
                type="text"
                name="name"
                placeholder="Menu Item Name"
                value={menuData.name}
                onChange={handleMenuChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={menuData.description}
                onChange={handleMenuChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={menuData.price}
                onChange={handleMenuChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Item Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleMenuImageChange}
                  accept="image/*"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="foodType"
                      checked={menuData.isVeg}
                      onChange={() => setMenuData({...menuData, isVeg: true})}
                    />
                    <span className="ml-2">Vegetarian</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="foodType"
                      checked={!menuData.isVeg}
                      onChange={() => setMenuData({...menuData, isVeg: false})}
                    />
                    <span className="ml-2">Non-Vegetarian</span>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Add Menu Item
              </button>
            </form>

            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Menu Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div key={item._id} className="p-4 bg-gray-50 rounded-lg">
                  {item.image && (
                    <img 
                      src={`https://foodweb-backend-g881.onrender.com/uploads/${item.image}`} 
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  <p className="text-gray-800 font-bold">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;


----------------------------------------------------------------------------------------------------------------------


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
        axios.get(`http://localhost:5000/api/superadmin/orders/${userId}`, {
          headers: { Authorization: localStorage.getItem("token") }
        }),
        axios.get(`http://localhost:5000/api/superadmin/subscriptions/${userId}`, {
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
      await axios.delete(`http://localhost:5000/api/superadmin/users/${id}`, {
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
    <div className="bg-orange-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-24">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4 bg-white rounded-lg shadow-lg p-6 sticky top-6">
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
                    ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg'
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
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeTab === 'customers' && 'Customers'}
                  {activeTab === 'restaurantAdmins' && 'Restaurant Admins'}
                  {activeTab === 'superAdmins' && 'Super Admins'}
                  {activeTab === 'restaurants' && 'Restaurants'}
                </h2>
                <p className="text-gray-500">
                  {activeTab === 'customers' && `${filteredCustomers.length} customers found`}
                  {activeTab === 'restaurantAdmins' && `${filteredRestaurantAdmins.length} admins found`}
                  {activeTab === 'superAdmins' && `${filteredSuperAdmins.length} super admins found`}
                  {activeTab === 'restaurants' && `${filteredRestaurants.length} restaurants found`}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === 'customers' &&
                      filteredCustomers.map(user => (
                        <tr
                          key={user._id}
                          className="border-t hover:bg-gray-50 transition-all duration-200"
                        >
                          <td className="p-4">{user.name}</td>
                          <td className="p-4">{user.email}</td>
                          <td className="p-4">{formatDate(user.createdAt)}</td>
                          <td className="p-4">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                deleteUser(user._id);
                              }}
                              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
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


---------------------------------------------------------------------------------------------------------------

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
        axios.get(`http://localhost:5000/api/superadmin/orders/${userId}`, {
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
      await axios.delete(`http://localhost:5000/api/superadmin/restaurants/${id}`, {
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
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-24 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Quick Stats</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">Total Restaurants</p>
                  <p className="text-2xl font-bold">{restaurants.length}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-600">Active Orders</p>
                  <p className="text-2xl font-bold">
                    {[...userOrders, ...restaurantOrders].filter(order => order.status === 'Pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Navigation</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'customers' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Customers
                </button>
                <button
                  onClick={() => setActiveTab('restaurantAdmins')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'restaurantAdmins' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Restaurant Admins
                </button>
                <button
                  onClick={() => setActiveTab('superAdmins')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'superAdmins' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Super Admins
                </button>
                <button
                  onClick={() => setActiveTab('restaurants')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'restaurants' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Restaurants
                </button>
              </div>
            </div>
          </div>

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
                            <tr className="bg-gray-100">
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
                            <tr className="bg-gray-100">
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
                            <tr className="bg-gray-100">
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
                            <tr className="bg-gray-100">
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
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
