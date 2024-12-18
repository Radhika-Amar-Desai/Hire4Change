import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import LandingPage from "../src/pages/LandingPage.jsx";
import Search from "../src/pages/Search.jsx";
import JobDetails from "../src/pages/JobDetails.jsx";
import Chat from "../src/pages/Chat.jsx";
import Login from "../src/pages/Login.jsx";
import UserLogin from "./pages/UserLogin.jsx";
import OrgLogin from "./pages/OrgLogin.jsx";
import Register from "./pages/Register.jsx";
import UserRegister from "./pages/UserRegister.jsx";
import OrgRegister from "./pages/OrgRegister.jsx";
import Profile from "./pages/profile.jsx";
import PostJobs from "./pages/PostJobs.jsx";
import MemberInfo from "./pages/MemberInformation.jsx";

const WebRoutes = () => {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<Search />} />
      <Route path="/search/:id" element={<JobDetails />} />
      <Route path="/messages" element={<Chat />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/user-login" element={<UserLogin />} />
      <Route path="/org-login" element={<OrgLogin />} />
      
      <Route path="/register" element={<Register />} />
      <Route path="/user-register" element={<UserRegister />} />
      <Route path="/org-register" element={<OrgRegister />} />
      
      <Route path="/profile" element={<Profile />} />
      <Route path="/postJobs" element={<PostJobs />} />
      <Route path="/member-information" element={<MemberInfo />} />
    </Routes>
  );
};

export default WebRoutes;
