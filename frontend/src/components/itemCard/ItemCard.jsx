import React, { useEffect, useState } from "react";
import "./ItemCard.scss";
import { Link } from "react-router-dom";
import ASSETS from "../../config/assetsConfig";

const ItemCard = ({ item }) => {

  console.log(item);

  return (
    <Link to={`/search/${item._id}`} className="link">
      <div className="itemCard rounded-lg">
        <div className="relative h-[17vh]">
          {item.images[0] ? (
            <img className="w-full h-full" src={item.images[0]} />
          ) : (
            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">
              No Image
            </h1>
          )}
        </div>
        <div className="text-xl font-bold flex justify-center items-center text-center">
          {item.title}
        </div>

        <div className="info">
            <div className="user flex overflow-x-scroll justify-center items-center gap-2">
              <img src={item?.img || ASSETS.defaultProfilePic} alt="User"/>
              <p className="leading-none tracking-tighter h-[4vw] text-md text-left font-light">
                <span className="text-mg text-zinc-400 mr-2">
                  {item?.publisher}:
                </span>
                <span className="font-serif">
                    {item.description}
                </span>
              </p>
            </div>
        </div>
        <hr />
        <div className="detail flex">
          <div className="price">
            <span>STARTING AT</span>
            <h2>INR {item.priceQuote.amount}</h2> {/* Fixed price display */}
          </div>
          <span className="text-xl font-bold text-zinc-800 bg-gray-400 rounded-full px-2 py-1">
            {item.type}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
