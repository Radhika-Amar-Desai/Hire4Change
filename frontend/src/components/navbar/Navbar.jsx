import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ASSETS from "../../config/assetsConfig";

function NavBarImage({ source }) {
  return (
    <div className="font-bold mx-[2vw] flex items-center">
      <Link to="/">
        <span className="w-[80px]">
          <img className="w-[80px]" src={source} alt="Logo" />
        </span>
      </Link>
    </div>
  );
}

const Register = () => {
  return (
    <div className="text-white px-4 py-2">
      <Link to={"/register"} className="hover:bg-gray-700 p-2 rounded">
        Register
      </Link>
    </div>
  );
};

const Login = () => {
  return (
    <div className="text-white px-4 py-2">
      <Link to={`/login`} className="hover:bg-gray-700 p-2 rounded">
        Login
      </Link>
    </div>
  );
};

const Profile = () => {
  const profilePicURL = localStorage.getItem("profilePicURL");
  const username = localStorage.getItem("username");

  return (
    <div className="flex">
      {profilePicURL ? (
        <NavBarImage source={profilePicURL} />
      ) : (
        <NavBarImage source={ASSETS.defaultProfilePic} />
      )}
      <div className="text-white px-4 py-2">
        <span className="hover:bg-gray-700 p-2 rounded">{username}</span>
      </div>
    </div>
  );
};

const RegisterLogin = () => {
  return (
    <>
      <Register />
      <Login />
    </>
  );
};

const Logout = ({ onLogout }) => {
  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");
    onLogout(); // Trigger state update in parent component
  };

  return (
    <div className="text-white px-4 py-2">
      <button className="hover:bg-gray-700 p-2 rounded" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};

const ServicesAfterLogin = ({ onLogout }) => {
  return (
    <>
      <div className="text-white px-4 py-2">
        <Link to={`/profile`} className="hover:bg-gray-700 p-2 rounded">
          Edit Profile
        </Link>
      </div>
      <div className="text-white px-4 py-2">
        <Link to={`/`} className="hover:bg-gray-700 p-2 rounded">
          Wallet
        </Link>
      </div>
      <div className="text-white px-4 py-2">
        <Link to={`/`} className="hover:bg-gray-700 p-2 rounded">
          Messages
        </Link>
      </div>
      <Logout onLogout={onLogout} />
      <Profile />
    </>
  );
};

const Links = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  // Sync localStorage with state
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="flex space-x-4">
      <div className="text-white px-4 py-2">
        <Link className="hover:bg-gray-700 p-2 rounded" to={`/`}>
          Home
        </Link>
      </div>
      <div className="text-white px-4 py-2">
        <Link className="hover:bg-gray-700 p-2 rounded" to={`/`}>
          About Us
        </Link>
      </div>
      <div className="text-white px-4 py-2">
        <Link className="hover:bg-gray-700 p-2 rounded" to={`/`}>
          Contact Us
        </Link>
      </div>
      {isLoggedIn ? (
        <ServicesAfterLogin onLogout={handleLogout} />
      ) : (
        <RegisterLogin />
      )}
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 flex bg-gray-800 p-4">
      <NavBarImage source={ASSETS.logo} />
      <div className="ml-auto">
        <Links />
      </div>
    </nav>
  );
};

export default Navbar;
