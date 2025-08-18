const express = require("express");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/place", authMiddleware, async (req, res) => {
  try {
    const { restaurant, items } = req.body;

    if (!restaurant || !items.length) {
      return res.status(400).json({ message: "Restaurant and items are required" });
    }

    // Fetch menu items from the database using IDs
    const menuItemIds = items.map(i => i.menuItem).filter(id => id); // ✅ Ensure IDs exist
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    // Format order items correctly
    const formattedItems = items.map((item) => {
      const menuItem = menuItems.find(m => m._id.toString() === (item.menuItem ? item.menuItem.toString() : ""));
      
      if (!menuItem) {
        throw new Error(`Menu item with ID ${item.menuItem} not found`);
      }

      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        description: menuItem.description || "",
        quantity: item.quantity || 1,
      };
    });

    // Store the complete order details
    const newOrder = new Order({
      customer: req.user.id,
      restaurant,
      items: formattedItems,  // ✅ Now storing name, price, and description
      status: "Pending",
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error.message);
    res.status(500).json({ message: error.message || "Error placing order" });
  }
});




// In your orders route file
router.put('/update-status/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('restaurant items.menuItem');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Get orders for a restaurant (For restaurant admins)
router.get("/restaurant-orders", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "Restaurant Admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Change 'owner' to 'admin' to match your schema
    const restaurants = await Restaurant.find({ admin: req.user.id });
    const restaurantIds = restaurants.map(r => r._id);

    if (restaurantIds.length === 0) {
      return res.json([]);
    }

    const orders = await Order.find({ restaurant: { $in: restaurantIds } })
      .populate("restaurant", "name")
      .populate("customer", "name email")
      .populate("items.menuItem", "name price description");

    res.json(orders);
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});


// ✅ Get orders for the logged-in customer
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('restaurant', 'name') // Populate restaurant name
      .populate('items.menuItem', 'name price');  // Populate menu item name and price

console.log(orders)
    // Log the full orders data, including items
    console.log("Orders fetched:", JSON.stringify(orders, null, 2));

    if (!orders.length) {
      return res.status(404).json({ msg: "No orders found" });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message });
  }
});


// Add this delete route
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      customer: req.user.id,
      status: 'Pending' // Only allow deletion of pending orders
    });

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found or not eligible for deletion' 
      });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order' });
  }
});

module.exports = router;