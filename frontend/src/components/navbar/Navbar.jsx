import React from 'react';
import { Link } from "react-router-dom";
import ASSETS from '../../config/assetsConfig';

function NavBarImage({source}){
  return (
    <div className="font-bold mx-[2vw] flex items-center">
      <Link to="/">
        <span className="w-[80px]">
          <img className="w-[80px]" src={source} alt="Logo" />
        </span>
      </Link>
    </div>
  );
};

const Register = () => {
  return (
    <div className="text-white px-4 py-2">
        <a href="#services" className='hover:bg-gray-700 p-2 rounded'>Register</a>
    </div>
  )
}

const Login = () => {
  return (
    <div className="text-white px-4 py-2">
        <span className='hover:bg-gray-700 p-2 rounded'>Login</span>
    </div>
  )
}

const Profile = () => {
  const profilePicURL = localStorage.getItem("profilePicURL");
  const username = localStorage.getItem("username");
  return(
    <div className="flex">
      {profilePicURL?<NavBarImage source={profilePicURL}/>:<NavBarImage source={ASSETS.defaultProfilePic}/>}
      <div className="text-white px-4 py-2">
        <span className='hover:bg-gray-700 p-2 rounded'>{username}</span>
    </div>
    </div>
  )
}

const RegisterLogin = () => {
  return (
    <>
      <Register/>
      <Login/>
    </>
  )
}

const ServicesAfterLogin = () => {
  return(
    <>
        <div className="text-white px-4 py-2">
          <a href="#services" className='hover:bg-gray-700 p-2 rounded'>Edit Profile</a>
        </div>
        <div className="text-white px-4 py-2">
          <a href="#services" className='hover:bg-gray-700 p-2 rounded'>Wallet</a>
        </div>
        <div className="text-white px-4 py-2">
          <a href="#services" className='hover:bg-gray-700 p-2 rounded'>Messages</a>
        </div>
        <div className="text-white px-4 py-2">
          <a href="#services" className='hover:bg-gray-700 p-2 rounded'>Log Out</a>
        </div>
        <Profile/>
    </>
  )
}

const Links = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  return (
    <div className="flex space-x-4">
      <div className="text-white px-4 py-2">
        <a className='hover:bg-gray-700 p-2 rounded'>Home</a>
      </div>
      <div className="text-white px-4 py-2">
        <a className='hover:bg-gray-700 p-2 rounded'>About Us</a>
      </div>
      <div className="text-white px-4 py-2">
        <a href="#services" className='hover:bg-gray-700 p-2 rounded'>Contact Us</a>
      </div>
      {isLoggedIn ? <ServicesAfterLogin/> : <RegisterLogin/>}
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 flex bg-gray-800 p-4">
      <NavBarImage source={ASSETS.logo}/>
      <div className="ml-auto"> {/* Added this div to push links to the right */}
        <Links />
      </div>
    </nav>
  );
};

export default Navbar;
