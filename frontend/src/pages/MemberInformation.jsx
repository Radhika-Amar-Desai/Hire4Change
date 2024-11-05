// import React from "react";
// import userImage from "../assets/person.avif";

// function FaceCard({ key }) {
//   return (
//     <div className="flex flex-col items-center cursor-pointer hover:shadow-lg p-4 rounded-lg transition-shadow duration-200 w-[300px] h-auto">
//       <img
//         src={userImage}
//         alt="User"
//         className="w-full object-cover rounded-md mb-4"
//       />
//       <h3 className="text-lg font-semibold text-gray-700">User</h3>
//     </div>
//   );
// }

// function MemberInfo() {
//   const num = 15;
//   const numbers = Array(num).fill(num);

//   return (
//     <div className="flex justify-center items-center min-h-screen">
//       <div className="grid grid-cols-3 gap-[5vw]">
//         {numbers.map((_, index) => (
//           <FaceCard key={index} />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default MemberInfo;

// import React from "react";
// import userImage from "../assets/person.avif";
// import API_ENDPOINTS from "../config/apiConfig";
// import { useNavigate } from "react-router-dom";

// function FaceCard({ memberName, onClick }) {
//   const navigate = useNavigate();
//   return (
//     <div className="flex flex-col items-center cursor-pointer hover:shadow-lg p-4 rounded-lg transition-shadow duration-200 w-[300px] h-auto">
//       <img
//         src={userImage}
//         alt="User"
//         className="w-full object-cover rounded-md mb-4"
//         onClick={() => {localStorage.setItem("username", {memberName}); navigate('/');}}
//       />
//       <h3 className="text-lg font-semibold text-gray-700">{memberName}</h3>
//     </div>
//   );
// }

// function MemberInfo() {
//   const [memberNames, setMemberNames] = React.useState([]);
  
//   // Simulating fetching member names
//   React.useEffect(() => {
//     // Example of fetching member names from an API or other source
//     const fetchMemberNames = async () => {
//       // Replace this with your actual API call
//       const response = await fetch(API_ENDPOINTS.get_org_membernames, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ orgName: 'NGO' }), // Replace with the actual org name
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setMemberNames(data.memberNames);
//       } else {
//         console.error("Error fetching member names:", data.message);
//       }
//     };

//     fetchMemberNames();
//   }, []);

//   return (
//     <div className="flex justify-center items-center min-h-screen">
//       <div className="grid grid-cols-3 gap-[5vw]">
//         {memberNames.map((name, index) => (
//           <FaceCard key={index} memberName={name} />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default MemberInfo;

import React from "react";
import userImage from "../assets/person.avif";
import API_ENDPOINTS from "../config/apiConfig";
import { useNavigate } from "react-router-dom";

function FaceCard({ memberName, onClick }) {
  return (
    <div className="flex flex-col items-center cursor-pointer hover:shadow-lg p-4 rounded-lg transition-shadow duration-200 w-[300px] h-auto">
      <img
        src={userImage}
        alt={memberName} // Use memberName for accessibility
        className="w-full object-cover rounded-md mb-4"
        onClick={onClick} // Use the onClick prop
      />
      <h3 className="text-lg font-semibold text-gray-700">{memberName}</h3>
    </div>
  );
}

function MemberInfo() {
  const [memberNames, setMemberNames] = React.useState([]);
  const navigate = useNavigate(); // Move useNavigate here for clarity
  
  // Fetching member names
  React.useEffect(() => {
    const fetchMemberNames = async () => {
      const response = await fetch(API_ENDPOINTS.get_org_membernames, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orgName: 'NGO' }), // Replace with the actual org name
      });
      const data = await response.json();
      if (response.ok) {
        setMemberNames(data.memberNames);
      } else {
        console.error("Error fetching member names:", data.message);
      }
    };

    fetchMemberNames();
  }, []);

  const handleImageClick = (name) => {
    localStorage.setItem("username", name); // Store member name as a string
    localStorage.setItem("userType", "individual");
    navigate('/'); // Navigate to the desired route
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="grid grid-cols-3 gap-[5vw]">
        {memberNames.map((name, index) => (
          <FaceCard 
            key={index} 
            memberName={name} 
            onClick={() => handleImageClick(name)} // Pass the click handler
          />
        ))}
      </div>
    </div>
  );
}

export default MemberInfo;
