import React from "react";
import ASSETS from "../../config/assetsConfig";

const Footer = () => {
  
  return (
    <footer data-scroll data-scroll-speed="-.1" className="bg-white w-full">
      <div className=" w-full h-full mx-auto px-6 lg:px-28">
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start">
          <div className="flex flex-col lg:w-1/3 mb-8 lg:mb-0">
            <div className="flex items-center mb-4">
              <img src={ASSETS.logo} alt="Logo" className="w-100 h-10 mr-2" />
              <span className="text-2xl font-bold text-gray-800">
                Hire4Change
              </span>
            </div>
            <p className="text-gray-500">
              Hire4Change is a platform connecting freelancers with impactful
              projects to drive positive social and economic change.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 flex justify-between items-center">
          <p className="text-gray-500 text-sm">
            Copyright © 2024 Hire4Change | All Rights Reserved
          </p>
          <div className="flex space-x-4 text-gray-500">
            <a href="#facebook" className="hover:text-gray-700">
              F
            </a>
            <a href="#twitter" className="hover:text-gray-700">
              T
            </a>
            <a href="#instagram" className="hover:text-gray-700">
              I
            </a>
            <a href="#linkedin" className="hover:text-gray-700">
              L
            </a>
            <a href="#youtube" className="hover:text-gray-700">
              Y
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
