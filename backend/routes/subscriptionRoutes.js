const express = require("express");
const Subscription = require("../models/Subscription");
const MenuItem = require("../models/MenuItem");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Place a Subscription Order
router.post("/subscribe", authMiddleware, async (req, res) => {
  try {
    const { menuItem, subscriptionType, startDate, endDate } = req.body;

    if (!menuItem || !subscriptionType || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Verify if the menu item exists
    const menuItemData = await MenuItem.findById(menuItem);
    if (!menuItemData) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Create a new subscription
    const newSubscription = new Subscription({
      customer: req.user.id,
      menuItem,
      subscriptionType,
      startDate,
      endDate
    });

    await newSubscription.save();
    res.status(201).json({ message: "Subscription added successfully", subscription: newSubscription });
  } catch (error) {
    console.error("Error adding subscription:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get Subscriptions for the Logged-in Customer
router.get("/my-subscriptions", authMiddleware, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ customer: req.user.id })
      .populate("menuItem", "name price description"); // Fetch menu item details

    if (!subscriptions.length) {
      return res.status(404).json({ message: "No subscriptions found" });
    }

    res.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Add delete subscription route
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({
      _id: req.params.id,
      customer: req.user.id
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subscription' });
  }
});

// Add pause subscription route
router.put('/pause/:id', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { 
        _id: req.params.id,
        customer: req.user.id,
        endDate: { $gt: new Date() } // Only allow pausing active subscriptions
      },
      { isPaused: true },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found or expired' });
    }

    res.json({ message: 'Subscription paused successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error pausing subscription' });
  }
});

// Add resume subscription route
router.put('/resume/:id', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { 
        _id: req.params.id,
        customer: req.user.id,
        endDate: { $gt: new Date() } // Only allow resuming active subscriptions
      },
      { isPaused: false },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found or expired' });
    }

    res.json({ message: 'Subscription resumed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resuming subscription' });
  }
});

module.exports = router;
