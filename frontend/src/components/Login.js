import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://foodweb-backend-g881.onrender.com/api/auth/login",
        formData
      );

      console.log(res.data); // Debugging

      // Save user data in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("phone", res.data.phone);
      localStorage.setItem("address", res.data.address);

      // Redirect based on role
      if (res.data.role === "Customer") navigate("/customer-dashboard");
      else if (res.data.role === "Restaurant Admin") navigate("/restaurant-dashboard");
      else if (res.data.role === "Super Admin") navigate("/super-admin-dashboard");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-orange-50 to-orange-100 text-gray-600">
      <div className="bg-white bg-opacity-20 backdrop-blur-md shadow-lg p-8 rounded-xl w-96 text-center">
        <h2 className="text-3xl font-bold text-black mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="p-3 rounded-md bg-white bg-opacity-50 focus:bg-opacity-100 transition text-black outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="p-3 rounded-md bg-white bg-opacity-50 focus:bg-opacity-100 transition text-black outline-none"
          />
          <button
            type="submit"
            className="bg-orange-600 text-white p-3 rounded-md hover:bg-orange-700 transition"
          >
            Login
          </button>
        </form>
        <p className="text-black mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
