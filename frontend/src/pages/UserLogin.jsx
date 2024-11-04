import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config/apiConfig";

function UserLogin() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // New state for email
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const loginData = {
    username,
    email,
    password,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("username", loginData.username);
        localStorage.setItem("isLoggedIn", "true");

        navigate("/");
      } else {
        setError("Login failed: " + result.error);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div
      data-scroll
      data-scroll-speed="0.1"
      className="flex flex-col items-center justify-center mb-32 "
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <label className="text-6xl text-gray-400 mr-auto mb-[2vw]">
          Sign In
        </label>
        <label htmlFor="username" className="text-xl text-gray-400">
          Username
        </label>
        <input
          name="username"
          type="text"
          placeholder="johndoe"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          className="border-2 border-gray-200 p-2 lg:w-[20vw]"
        />
        <label htmlFor="email" className="text-xl text-gray-400">
          Email
        </label>
        <input
          name="email"
          type="text"
          placeholder="abc@gmail.com"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="border-2 border-gray-200 p-2 lg:w-[20vw]"
        />
        <label htmlFor="password" className="text-xl text-gray-400">
          Password
        </label>
        <input
          name="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          className="border-2 border-gray-200 p-2 lg:w-[20vw]"
        />
        <button
          type="submit"
          style={{ backgroundColor: "#017AC6", letterSpacing: "2px" }}
          className="lg:w-[20vw] p-4"
        >
          <span className="text-white font-semibold"> Sign In </span>
        </button>
        {error && <p id="message">{error}</p>}
      </form>
    </div>
  );
}

export default UserLogin;

