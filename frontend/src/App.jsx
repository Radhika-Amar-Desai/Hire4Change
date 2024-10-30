import React from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import WebRoutes from "./WebRoutes";
import Login from "./pages/Login";

import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="flex flex-col space-y-24 min-h-screen">
        <Navbar className="w-full" />
        <WebRoutes/>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
