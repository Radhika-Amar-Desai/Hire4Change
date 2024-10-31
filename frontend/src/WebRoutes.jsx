import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import LandingPage from "../src/pages/LandingPage.jsx";
import Search from "../src/pages/Search.jsx";
import JobDetails from "../src/pages/JobDetails.jsx";
import Chat from "../src/pages/Chat.jsx";
import Login from "../src/pages/Login.jsx";
import Register from "./pages/Register.jsx";

const WebRoutes = () => {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<Search />} />
      <Route path="/search/:id" element={<JobDetails />} />
      <Route path="/messages" element={<Chat />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />}/>
      {/* <Route path="/profile" element={<Profile />} />
        <Route path="/add" element={<NewGig />} />
        <Route path="/mygigs" element={<MyGigs />} />
        <Route path="/wallet" element={<Wallet />} /> */}
      {/* Ensure the correct path for Gig */}
    </Routes>
  );
};

export default WebRoutes;
