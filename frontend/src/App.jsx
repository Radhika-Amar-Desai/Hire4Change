import React from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import LandingPage from "./pages/LandingPage";

import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="flex flex-col space-y-24 min-h-screen">
        <Navbar className="w-full" />
        <LandingPage/>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
