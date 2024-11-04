import React from "react";
import { useNavigate } from "react-router-dom";
import organizationImage from "../assets/org.avif"; // replace with your actual image path
import userImage from "../assets/person.avif"; // replace with your actual image path

const Login = () => {
  const navigate = useNavigate();

  const handleOrganizationClick = () => {
    localStorage.setItem("userType", "org");
    navigate("/user-login"); // Route to Organization registration page
  };

  const handleUserClick = () => {
    localStorage.setItem("userType", "individual");
    navigate("/user-login"); // Route to User registration page
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] bg-gray-100">
      <div className="flex justify-around w-full max-w-3xl space-x-32">
        {/* Organization Registration Option */}
        <div
          onClick={handleOrganizationClick}
          className="flex flex-col items-center cursor-pointer hover:shadow-lg p-4 rounded-lg transition-shadow duration-200 w-[300px] h-auto"
        >
          <img
            src={organizationImage}
            alt="Organization"
            className="w-full object-cover rounded-md mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-700">Organization</h3>
        </div>

        {/* User Registration Option */}
        <div
          onClick={handleUserClick}
          className="flex flex-col items-center cursor-pointer hover:shadow-lg p-4 rounded-lg transition-shadow duration-200 w-[300px] h-auto"
        >
          <img
            src={userImage}
            alt="User"
            className="w-full object-cover rounded-md mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-700">User</h3>
        </div>
      </div>
    </div>
  );
};

export default Login;
