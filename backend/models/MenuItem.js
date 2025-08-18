const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  image: { type: String },
  isVeg: { 
    type: Boolean, 
    required: true,
    default: true // Set default to veg if not specified
  }
});

module.exports = mongoose.model("MenuItem", MenuItemSchema);