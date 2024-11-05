import React, { useState } from "react";
import API_ENDPOINTS from "../config/apiConfig";
import { useNavigate } from "react-router-dom";

const OrgRegister = () => {
  const [formData, setFormData] = useState({
    orgName: "",
    orgUsername: "",
    orgPassword: "",
    contactNumber: "",
    email: "",
    logo: null,
    excelFile: null,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("orgName", formData.orgName);
    data.append("orgUsername", formData.orgUsername);
    data.append("orgPassword", formData.orgPassword);
    data.append("contactNumber", formData.contactNumber);
    data.append("email", formData.email);
    data.append("logo", formData.logo); // Attach logo file
    data.append("excelFile", formData.excelFile); // Attach Excel file

    try {
      const response = await fetch(API_ENDPOINTS.register_org, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        alert("Error: " + errorResponse.message || "Something went wrong");
        return;
      }

      alert("Organization registered successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Organization Registration
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="orgName"
            >
              Organization Name
            </label>
            <input
              type="text"
              id="orgName"
              name="orgName"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              value={formData.orgName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="orgUsername"
            >
              Organization Username
            </label>
            <input
              type="text"
              id="orgUsername"
              name="orgUsername"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              value={formData.orgUsername}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="orgPassword"
            >
              Organization Password
            </label>
            <input
              type="text"
              id="orgPassword"
              name="orgPassword"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              value={formData.orgPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="contactNumber"
            >
              Contact Number
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              value={formData.contactNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="email"
            >
              Email ID
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="logo"
            >
              Logo Image
            </label>
            <input
              type="file"
              id="logo"
              name="logo"
              accept="image/*"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              onChange={handleFileChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="excelFile"
            >
              Excel Sheet for Registration of Members
            </label>
            <input
              type="file"
              id="excelFile"
              name="excelFile"
              accept=".xls,.xlsx"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              onChange={handleFileChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrgRegister;
