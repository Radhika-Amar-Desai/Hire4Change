import React from "react";
import ASSETS from "../../config/assetsConfig";

function AppInvite() {
  return (
    <div
      data-scroll
      data-scroll-speed="0.2"
      className="w-full flex gap-10 mb-10 pb-10 pt-28 px-20 items-center bg-gradient-to-b from-blue-500 to-blue-900"
    >
      <div className="phoneImg w-3/5 flex justify-center">
        <img className="w-[40vw] h-[40vw]" src={ASSETS.phoneImg} />
      </div>

      <div className="txt w-1/2 flex flex-col gap-10 flex-col justify-center text-center">
        <h1 className=" text-[3vw] text-white leading-none tracking-tight">
          Finding your job shall be one tap away!
        </h1>
        <h1 className="tracking-tighter text-[7vw] font-extrabold leading-none text-white">
          COMING SOON!
        </h1>
        <img src={ASSETS.appStores} />
      </div>
    </div>
  );
}

export default AppInvite;
