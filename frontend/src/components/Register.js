import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "Customer",
    adminCode: "",
  });

  const { name, email, phone, address, password, role, adminCode } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://foodweb-backend-g881.onrender.com/api/auth/register",
        formData
      );

      alert(res.data.message || "Registration successful!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        role: "Customer",
        adminCode: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error registering user");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={name}
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          value={email}
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          value={phone}
          placeholder="Phone"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          value={address}
          placeholder="Address"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <select name="role" value={role} onChange={handleChange}>
          <option value="Customer">Customer</option>
          <option value="Restaurant Admin">Restaurant Admin</option>
          <option value="Super Admin">Super Admin</option>
        </select>
        {role !== "Customer" && (
          <input
            type="text"
            name="adminCode"
            value={adminCode}
            placeholder="Admin Code"
            onChange={handleChange}
          />
        )}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
