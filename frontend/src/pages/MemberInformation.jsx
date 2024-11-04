import React from "react";
import userImage from "../assets/person.avif";

function FaceCard({key}) {
    return (
        <div className="flex flex-col items-center cursor-pointer hover:shadow-lg p-4 rounded-lg transition-shadow duration-200 w-[300px] h-auto">
                <img
                    src={userImage}
                    alt="User"
                    className="w-full object-cover rounded-md mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-700">User</h3>
        </div>
    )
}

function MemberInfo() {
    const num = 15;
    const numbers = Array(num).fill(num);
  
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="grid grid-cols-3 gap-[5vw]">
          {numbers.map((_, index) => (
            <FaceCard key={index} />
          ))}
        </div>
      </div>
    );
  }

export default MemberInfo;