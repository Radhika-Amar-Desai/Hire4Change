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
      <Link to={"/register"}>
        <button className="hover:bg-gray-700 p-2 rounded"> Register </button>
      </Link>
    </div>
  );
};

const Login = () => {
  return (
    <div className="text-white px-4 py-2">
      <Link to={`/login`}>
        <button className="hover:bg-gray-700 p-2 rounded"> Login </button>
      </Link>
    </div>
  );
};

const Profile = () => {
  const profilePicURL = localStorage.getItem("profilePicURL");
  const username = localStorage.getItem("username");

  return (
    <div className="flex">
      {/* {profilePicURL ? (
        <NavBarImage source={profilePicURL} />
      ) : (
        <NavBarImage source={ASSETS.defaultProfilePic} />
      )} */}
      <div className="text-white px-4 py-2">
        <span>
          {" "}
          <button className="hover:bg-gray-700 p-2 rounded font-bold">
            {" "}
            {username}{" "}
          </button>{" "}
        </span>
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

const ServicesForOrganization = ({ onLogout }) => {
  return (
    <>
      <div className="text-white px-4 py-2">
        <Link to={`/member-information`}>
          <button className="hover:bg-gray-700 p-2 rounded">
            {" "}
            Member Information{" "}
          </button>
        </Link>
      </div>
      <div className="text-white px-4 py-2">
        <Link to={`/postJobs`}>
          <button className="hover:bg-gray-700 p-2 rounded"> Post Jobs </button>
        </Link>
      </div>
      <Logout onLogout={onLogout} />
      <Profile />
    </>
  );
};

const ServicesForIndividuals = ({ onLogout }) => {
  return (
    <>
      <div className="text-white px-4 py-2">
        <Link to={`/profile`} className="hover:bg-gray-700 p-2 rounded">
          <button className="hover:bg-gray-700 p-2 rounded">
            {" "}
            Edit Profile{" "}
          </button>
        </Link>
      </div>
      {/* <div className="text-white px-4 py-2">
        <Link to={`/`} className="hover:bg-gray-700 p-2 rounded">
          Wallet
        </Link>
      </div> */}
      <div className="text-white px-4 py-2">
        <Link to={`/messages`}>
          <button className="hover:bg-gray-700 p-2 rounded"> Messages </button>
        </Link>
      </div>
      <div className="text-white px-4 py-2">
        <Link to={`/postJobs`}>
          <button className="hover:bg-gray-700 p-2 rounded"> Post Jobs </button>
        </Link>
      </div>
      {/* <Logout onLogout={onLogout} /> */}
      <div className="flex items-center justify-between text-white px-4 py-2">
        <button className="hover:bg-gray-700 p-2 rounded" onClick={onLogout}>
          Log Out
        </button>
      </div>

      <Profile />
    </>
  );
};

const ServicesAfterLogin = ({ onLogout, userType }) => {
  return (
    <>
      {userType == "org" ? (
        <ServicesForOrganization onLogout={onLogout} />
      ) : (
        <ServicesForIndividuals onLogout={onLogout} />
      )}
    </>
  );
};

const Links = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const [userType, setUserType] = useState(localStorage.getItem("userType"));

  // Sync localStorage with state
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
      setUserType(localStorage.getItem("userType"));
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
        <Link to={`/`}>
          <button className="hover:bg-gray-700 p-2 rounded"> Home </button>
        </Link>
      </div>
      <div className="text-white px-4 py-2">
        <Link to={`/`}>
          <button className="hover:bg-gray-700 p-2 rounded"> About Us </button>
        </Link>
      </div>
      <div className="text-white px-4 py-2">
        <Link to={`/`}>
          <button className="hover:bg-gray-700 p-2 rounded">
            {" "}
            Contact Us{" "}
          </button>
        </Link>
      </div>
      {isLoggedIn ? (
        <ServicesAfterLogin onLogout={handleLogout} userType={userType} />
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
