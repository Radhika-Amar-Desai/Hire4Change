import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import ASSETS from "../../config/assetsConfig";

const SearchBar = () => {
    return (
      <div className="relative max-w-lg">
        <input
            placeholder="Search ..."
            className="w-[32vw] h-[2.5vw] px-4 py-2 pl-10 border border-gray-300 rounded-full focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
/>
        <div
          className="absolute inset-y-0 left-0 flex items-center pl-3"
        >
          <FaSearch className="text-gray-400" />
        </div>
      </div>
    );
  };
  
const Stat = ({ number, text_content }) => {
    return (
      <div className="left mr-10 flex flex-col items-start">
        <h2 className="text-[3vw] font-semibold">{number}</h2>
        <h3 className="text-[1vw] opacity-65">{text_content}</h3>
      </div>
    );
  };
  

const Stats = () => {
    return (
      <div className="mt-[2vw] w-2/3 flex flex-row">
        <Stat number="53%" text_content="Find it difficult to connect"></Stat>
        <div className="line"></div>
        <Stat
          number="43%"
          text_content="Vacant posts in bluecollar sector"
        ></Stat>
        <div className="line"></div>
        <Stat number="60%" text_content="Shelters are overcrowded"></Stat>
      </div>
    );
};

function Hero() {
    return (
      <div
        data-scroll
        data-scroll-speed="0.2"
        className="h-[60vw] my-0 flex flex-row justify-center items-center relative"
        style={{
          backgroundImage: `url(${ASSETS.heroBackgroundImg})`,
          backgroundSize: `100% 100%`,
          backgroundPosition: `center`,
        }}
      >
        <div className="w-1/2 h-screen flex flex-col justify-center mr-[10vw] space-y-[2vw]">
          <h1 className="text-[5vw] font-bold leading-[5.5vw] tracking-tighter">
            Find your <br />
            <span style={{ color: "#0A0700FF" }}>new job</span> with us
          </h1>
          <SearchBar/>
          <Stats></Stats>
        </div>
      </div>
    );
  }
  
export default Hero;