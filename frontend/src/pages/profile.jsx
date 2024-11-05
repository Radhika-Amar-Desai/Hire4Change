import React, { useState, useEffect, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config/apiConfig";
import { FaTrash } from 'react-icons/fa';

const VarContext = createContext();

const EditableInput = ({ field, defaultVal, style }) => {
  const [data, setData] = useState(defaultVal); // Replace "Initial Value" with any initial value you prefer.

  return (
    <input
      className={"focus:outline-none " + style}
      type="text"
      name={field}
      value={data}
      onChange={(e) => setData(e.target.value)} // Updates the state with user input
    />
  );
};

const SubmitButton = ({ content, additionalStyle, handleSubmit }) => {
  return (
    <button
      type="submit"
      className={"bg-blue-500 text-white py-2 px-4 rounded " + additionalStyle}
      onClick={handleSubmit}
    >
      {content}
    </button>
  );
};

function isAJob(str) {
  return str.toLowerCase().endsWith("jobs");
}

function camelCaseToTitle(str) {
  let result = "";

  for (let i = 0; i < str.length; i++) {
    if (str[i] === str[i].toUpperCase() && i !== 0) {
      result += " " + str[i];
    } else {
      result += str[i];
    }
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

const Job_content = ({ jobData }) => {
  const {
    userData,
    setUserData,
    error,
    setError,
    activeTab,
    setActiveTab,
    isJobsMenuOpen,
    setIsJobsMenuOpen,
    handleJobClick,
    handlePortfolioSubmit,
    handleJobMenuClick,
    handleWorkExperienceSubmit,
  } = useContext(VarContext);
  // console.log(jobData);
  return (
    <>
      {
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[1vw] font-medium text-gray-500 uppercase tracking-wider">
                Job ID
              </th>
              <th className="px-6 py-3 text-left text-[1vw] font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobData.map((job) => (
              // <tr key={job.title} onClick={() => handleJobClick(job.job)}>
              <tr key={job.title}>
                <td className="px-6 py-4 whitespace-nowrap text-[1vw] font-medium text-gray-900">
                  {job.job}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[1vw] text-gray-500">
                  {job.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </>
  );
};

const Job = () => {
  const {
    userData,
    setUserData,
    error,
    setError,
    activeTab,
    setActiveTab,
    isJobsMenuOpen,
    setIsJobsMenuOpen,
    handleJobClick,
    handlePortfolioSubmit,
    handleJobMenuClick,
    handleWorkExperienceSubmit,
  } = useContext(VarContext);

  const title = camelCaseToTitle(activeTab);
  const no_jobs_message = "No " + title + " Available";

  // console.log(title);

  var jobData = "";
  if (title == "Completed Jobs") {
    jobData = userData?.completedJobs;
  } else if (title == "Assigned Jobs") {
    jobData = userData?.activeJobs;
  } else if (title == "Saved Jobs") {
    jobData = userData?.savedJobs;
  } else if (title == "Posted Jobs") {
    jobData = userData?.postedJobs;
  }

  //console.log(jobData);

  return (
    <>
      <div>
        <p className="sm:text-[4vw] lg:text-[2vw] font-semibold">{title}</p>
        <p>
          {userData && userData[activeTab]?.length ? (
            <Job_content jobData={jobData} />
          ) : (
            no_jobs_message
          )}
        </p>
      </div>
    </>
  );
};

const JobMenuComponent = ({ job_status, display_title }) => {
  const {
    userData,
    setUserData,
    error,
    setError,
    activeTab,
    setActiveTab,
    isJobsMenuOpen,
    setIsJobsMenuOpen,
    handleJobClick,
    handlePortfolioSubmit,
    handleJobMenuClick,
    handleWorkExperienceSubmit,
  } = useContext(VarContext);

  return (
    <>
      <button
        onClick={function () {
          handleJobMenuClick(job_status);
        }}
        className={`block w-full px-4 py-2 sm:text-[1.5vw] lg:text-[1vw] text-gray-500`}
      >
        {display_title}
      </button>
    </>
  );
};

const JobMenu = () => {
  return (
    <div className="absolute bg-white border border-gray-300 shadow-md rounded-md mt-2 right-0">
      <JobMenuComponent job_status="completedJobs" display_title="Completed" />
      <JobMenuComponent job_status="postedJobs" display_title="Posted" />
      <JobMenuComponent job_status="savedJobs" display_title="Saved" />
      <JobMenuComponent job_status="assignedJobs" display_title="Assigned" />
    </div>
  );
};

const JobNavBar = () => {
  const {
    userData,
    setUserData,
    error,
    setError,
    activeTab,
    setActiveTab,
    isJobsMenuOpen,
    setIsJobsMenuOpen,
    handleJobClick,
    handlePortfolioSubmit,
    handleJobMenuClick,
    handleWorkExperienceSubmit,
  } = useContext(VarContext);

  return (
    <div className="relative">
      <button
        onClick={function () {
          setActiveTab("MyJob");
          setIsJobsMenuOpen(!isJobsMenuOpen);
        }}
        className={`py-2 px-4 text-[1.5vw] font-semibold ${
          activeTab === "MyJob"
            ? "border-b-2 border-orange-500 text-blue-500"
            : "text-gray-600"
        }`}
      >
        My Jobs
      </button>
      <div className="">{isJobsMenuOpen && <JobMenu />}</div>
    </div>
  );
};

const ProfileSectionImage = ({ imageSrc }) => {
  return (
    <img
      className="w-[20vw] h-[20vw] object-cover rounded-2xl border-2 border-indigo-800 bg-center"
      src={imageSrc || "default-profile-picture-url"}
      alt="Profile Picture"
    />
  );
};

const ProfileDataRow = ({ field, data }) => {
  return (
    <div className="h-[5vw] flex">
      <label className="text-[1.5vw] font-normal p-4 whitespace-nowrap">
        {field}
      </label>
      <EditableInput
        defaultVal={data}
        field={field}
        style="text-[1.5vw] text-gray-400 ml-auto"
      />
    </div>
  );
};

const ProfileSection = ({ userData }) => {
  return (
    <div className="grid grid-cols-2">
      <div className="flex items-center">
        <ProfileSectionImage imageSrc={userData?.profilePictureUrl} />
      </div>

      <form className="divide-y divide-gray-200">
        <ProfileDataRow field="Username" data={userData?.username} />
        <ProfileDataRow field="Email" data={userData?.email} />
        <ProfileDataRow field="Phone Number" data={userData?.phoneNumber} />
        <ProfileDataRow field="Bio" data={userData?.bio} />
        <ProfileDataRow
          field="Freelancer Rating"
          data={userData?.ratings?.asFreelancer?.toFixed(1) || "N/A"}
        />
        <ProfileDataRow
          field="Employer Rating"
          data={userData?.ratings?.asEmployer?.toFixed(1) || "N/A"}
        />
        <ProfileDataRow field="Skills" data={userData?.skills?.join(", ")} />
        <ProfileDataRow
          field="Languages"
          data={userData?.languages?.join(", ")}
        />
        <SubmitButton
          content={"Submit Changes"}
          additionalStyle={"w-full mt-4"}
        />
      </form>
    </div>
  );
};

const ProfileNavBarComponent = ({ title, display_title }) => {
  const {
    userData,
    setUserData,
    error,
    setError,
    activeTab,
    setActiveTab,
    isJobsMenuOpen,
    setIsJobsMenuOpen,
    handleJobClick,
    handlePortfolioSubmit,
    handleJobMenuClick,
    handleWorkExperienceSubmit,
  } = useContext(VarContext);

  return (
    <div className="relative">
      <button
        onClick={function () {
          setActiveTab(title);
        }}
        className={`py-2 px-4 text-[1.5vw] font-semibold ${
          activeTab === title
            ? "border-b-2 border-orange-500 text-blue-500"
            : "text-gray-600"
        }`}
      >
        {display_title}
      </button>
    </div>
  );
};

const ProfileNavBar = () => {
  const {
    userData,
    setUserData,
    error,
    setError,
    activeTab,
    setActiveTab,
    isJobsMenuOpen,
    setIsJobsMenuOpen,
    handleJobClick,
    handlePortfolioSubmit,
    handleJobMenuClick,
  } = useContext(VarContext);

  return (
    <nav className="flex float-right">
      <ProfileNavBarComponent title="profile" display_title="Profile" />
      <ProfileNavBarComponent title="education" display_title="Education" />
      <ProfileNavBarComponent title="reviews" display_title="Reviews" />
      <JobNavBar />
      <ProfileNavBarComponent title="portfolio" display_title="Portfolio" />
      <ProfileNavBarComponent title="work" display_title="Work Experience" />
    </nav>
  );
};



const TableRow = ({ row_content, onDelete, rowIndex }) => {
  return (
    <tr className="h-10">
      {row_content.map((item, index) => (
        <td key={index} className="text-center">
          <EditableInput defaultVal={item} style={"text-center w-full"} />
        </td>
      ))}
      {/* Updated delete button with a Font Awesome trash icon */}
      <td className="text-center">
        <button onClick={() => onDelete(rowIndex)} className="text-red-500 hover:text-red-700">
          <FaTrash size={18} />
        </button>
      </td>
    </tr>
  );
};



const Table = ({ titles, data, onDelete }) => {
  return (
    <table className="w-full border-separate border-spacing-4">
      <thead>
        <tr className="border-b border-gray-200">
          {titles.map((title, index) => (
            <th
              key={index}
              className="text-[2vw] sm:text-[2vw] lg:text-[1vw] text-gray-400"
            >
              {title.toUpperCase()}
            </th>
          ))}
          {/* Add an empty header for the delete button column */}
          <th className="text-gray-400"></th>
        </tr>
      </thead>

      <tbody>
        {data.map((item, index) => (
          <TableRow
            key={index}
            row_content={item}
            onDelete={onDelete}
            rowIndex={index}
          />
        ))}
      </tbody>
    </table>
  );
};



const Education = ({ userData, setUserData }) => {
  const [showForm, setShowForm] = useState(false);
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    fieldOfStudy: '',
  });

  const titles = ["Degree", "Institution", "Field Of Study"];
  const data = userData?.education.map((edu) => [
    edu.degree,
    edu.institution,
    edu.fieldOfStudy,
  ]);

  const handleDelete = async (index) => {
    const deletedEducation = userData.education[index];
    
    // Update local state first
    const updatedEducation = userData.education.filter((_, i) => i !== index);
    setUserData({ ...userData, education: updatedEducation });
  
    // Send delete request to the backend
    try {
      const response = await fetch("http://localhost:5000/delete-education", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username,  // Assuming `username` is part of `userData`
          institution: deletedEducation.institution,
          degree: deletedEducation.degree,
        }),
      });
  
      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Failed to delete education:", error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEducation({ ...newEducation, [name]: value });
  };

  const handleAddEducation = async () => {
    // Update local state first
    setUserData({
      ...userData,
      education: [...userData.education, newEducation],
    });
  
    // Send data to the backend
    try {
      const response = await fetch("http://localhost:5000/add-education", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username,  // Assuming `username` is part of `userData`
          institution: newEducation.institution,
          degree: newEducation.degree,
          fieldOfStudy: newEducation.fieldOfStudy,
          from: newEducation.from,      // Optional: Add these if available in `newEducation`
          to: newEducation.to,          // Optional: Add these if available in `newEducation`
        }),
      });
  
      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Failed to add education:", error);
    }
  
    // Reset form and hide it
    setNewEducation({ degree: '', institution: '', fieldOfStudy: '' });
    setShowForm(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-2xl font-semibold text-gray-800">Education</div>
      {data.length !== 0 ? (
        <div>
          <Table titles={titles} data={data} onDelete={handleDelete} />
        </div>
      ) : (
        <p className="text-gray-500 italic">No Education Available</p>
      )}

      {/* Add Education Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-white text-gray-600 border border-gray-300 font-medium px-6 py-2 mt-4 rounded-md hover:bg-gray-100 active:bg-gray-200 transition duration-200 ease-in-out"
      >
        + Add Education
      </button>

      {/* Conditionally Render Form */}
      {showForm && (
        <div className="mt-6 p-6 border rounded-lg bg-gray-100 space-y-4 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700">Add New Education</h3>
          <input
            type="text"
            name="degree"
            placeholder="Degree"
            value={newEducation.degree}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition ease-in-out"
          />
          <input
            type="text"
            name="institution"
            placeholder="Institution"
            value={newEducation.institution}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition ease-in-out"
          />
          <input
            type="text"
            name="fieldOfStudy"
            placeholder="Field of Study"
            value={newEducation.fieldOfStudy}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition ease-in-out"
          />
          <button
            onClick={handleAddEducation}
            className="bg-blue-600 text-white font-medium px-6 py-2 rounded-md hover:bg-blue-700 active:bg-blue-800 transition duration-200 ease-in-out"
          >
            Add Entry
          </button>
        </div>
      )}
      <SubmitButton
        content={"Submit Changes"}
        additionalStyle={"w-full mt-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-3 rounded-md transition duration-200 ease-in-out"}
      />
    </div>
  );
};



const Review = ({ userData }) => {
  const titles = ["Comment", "Rating"];
  // console.log(userData?.reviews);
  const data = userData?.reviews.map((review) => [
    review.comment,
    review.rating,
  ]);

  return (
    <div className="space-y-[1vw]">
      <div className="sm:text-[4vw] lg:text-[2vw] font-semibold">Reviews</div>
      {data.length != 0 ? (
        <div>
          <Table titles={titles} data={data} />
          <SubmitButton
            content={"Submit Changes"}
            additionalStyle={"w-full mt-4"}
          />
        </div>
      ) : (
        <p>No Reviews Available</p>
      )}
    </div>
  );
};

const ImagesDiv = ({ images }) => {
  return (
    images != null &&
    images.length > 0 && <div className="flex space-x-2">{images}</div>
  );
};

const ProjectLinkDiv = ({ link }) => {
  return (
    link && (
      <a
        href={link}
        style={{ color: "blue" }}
        target="_blank"
        rel="noopener noreferrer"
      >
        View Project
      </a>
    )
  );
};

const Portfolio = () => {
  const {
    userData,
    setUserData,
    error,
    setError,
    activeTab,
    setActiveTab,
    isJobsMenuOpen,
    setIsJobsMenuOpen,
    handleJobClick,
    handlePortfolioSubmit,
    handleJobMenuClick,
    handleWorkExperienceSubmit,
  } = useContext(VarContext);

  const titles = ["Title", "Description", "Images", "Link"];
  console.log(userData?.portfolioItems);
  const data = userData?.portfolioItems.map((item) => [
    item.title,
    item.description,
    <ImagesDiv images={item.images} />,
    <ProjectLinkDiv link={item.link} />,
  ]);

  return (
    <div className="space-y-[4vw]">
      <div className="sm:text-[4vw] lg:text-[2vw] font-semibold">Portfolio</div>
      {data.length != 0 ? (
        <Table titles={titles} data={data} />
      ) : (
        <p>No Portfolio Available</p>
      )}
      <form
        onSubmit={handlePortfolioSubmit}
        className="flex-col flex justify-end"
      >
        <input
          name="portfolioTitle"
          type="text"
          placeholder="Title"
          className="border p-2 mb-2"
          required
        />
        <textarea
          name="portfolioDescription"
          placeholder="Description"
          className="border p-2 mb-2"
          required
        />
        <input
          name="portfolioImages"
          type="text"
          placeholder="Images (comma-separated URLs)"
          className="border p-2 mb-2"
          required
        />
        <input
          name="portfolioLink"
          type="text"
          placeholder="Link"
          className="border p-2 mb-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Add Portfolio Item
        </button>
      </form>
    </div>
  );
};

const WorkExperience = () => {
  const {
    userData,
    setUserData,
    error,
    setError,
    activeTab,
    setActiveTab,
    isJobsMenuOpen,
    setIsJobsMenuOpen,
    handleJobClick,
    handlePortfolioSubmit,
    handleJobMenuClick,
    handleWorkExperienceSubmit,
  } = useContext(VarContext);

  const titles = ["Title", "Company", "Location", "From", "To", "Description"];

  const data = userData?.portfolioItems.map((exp) => [
    exp.title,
    exp.company,
    exp.location,
    new Date(exp.from).toLocaleDateString(),
    new Date(exp.to).toLocaleDateString(),
    exp.description,
  ]);

  return (
    <div className="space-y-[4vw]">
      <div className="sm:text-[4vw] lg:text-[2vw] font-semibold">
        Work Experience
      </div>
      {data.length != 0 ? (
        <Table titles={titles} data={data} />
      ) : (
        <p>No Work Experience Available</p>
      )}
      <form
        onSubmit={handleWorkExperienceSubmit}
        className="flex-col flex justify-end"
      >
        <input
          name="workTitle"
          type="text"
          placeholder="Title"
          className="border p-2 mb-2"
          required
        />
        <input
          name="workCompany"
          type="text"
          placeholder="Company"
          className="border p-2 mb-2"
          required
        />
        <input
          name="workLocation"
          type="text"
          placeholder="Location"
          className="border p-2 mb-2"
          required
        />
        <input
          name="workFrom"
          type="date"
          placeholder="From"
          className="border p-2 mb-2"
          required
        />
        <input
          name="workTo"
          type="date"
          placeholder="To"
          className="border p-2 mb-2"
          required
        />
        <textarea
          name="workDescription"
          placeholder="Description"
          className="border p-2 mb-2"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Add Work Experience
        </button>
      </form>
    </div>
  );
};

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isJobsMenuOpen, setIsJobsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleJobClick = (e) => {
    navigate("/search/" + e);
  };

  const fetchUserProfile = async () => {
    try {
      const username = localStorage.getItem("username");
      if (!username) {
        throw new Error("User not logged in");
      }

      const response = await fetch(
        API_ENDPOINTS.profile + `?username=${username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      // console.log(data);
      if (response.ok) {
        setUserData(data);
      } else {
        setError("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Error fetching user profile");
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // console.log(userData);
  }, []);

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    try {
      const username = localStorage.getItem("username");
      if (!username) {
        alert("User not logged in");
        return;
      }

      const portfolioData = {
        username: username,
        title: e.target.portfolioTitle.value,
        description: e.target.portfolioDescription.value,
        images: e.target.portfolioImages.value
          .split(",")
          .map((img) => img.trim()),
        link: e.target.portfolioLink.value,
      };

      const response = await fetch(API_ENDPOINTS.add_portfolio, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(portfolioData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Portfolio updated successfully!");
        fetchUserProfile();
      } else {
        alert("Error updating portfolio: " + result.error);
      }
    } catch (error) {
      console.error("Error submitting portfolio:", error);
    }
  };

  const handleWorkExperienceSubmit = async (e) => {
    e.preventDefault();
    try {
      const username = localStorage.getItem("username");
      if (!username) {
        alert("User not logged in");
        return;
      }

      const workData = {
        username,
        title: e.target.workTitle.value,
        company: e.target.workCompany.value,
        location: e.target.workLocation.value,
        from: e.target.workFrom.value,
        to: e.target.workTo.value,
        description: e.target.workDescription.value,
      };

      const response = await fetch(API_ENDPOINTS.add_work_experience, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Work experience updated successfully!");
        fetchUserProfile();
      } else {
        alert("Error updating work experience: " + result.error);
      }
    } catch (error) {
      console.error("Error submitting work experience:", error);
    }
  };

  const handleJobMenuClick = (tab) => {
    setActiveTab(tab);
    setIsJobsMenuOpen(false);
  };

  if (error) return <div className="text-red-500">{error}</div>;

  const titles = ["Degree", "Institution", "Field Of Study"];

  return (
    <VarContext.Provider
      value={{
        userData,
        setUserData,
        error,
        setError,
        activeTab,
        setActiveTab,
        isJobsMenuOpen,
        setIsJobsMenuOpen,
        handleJobClick,
        handlePortfolioSubmit,
        handleJobMenuClick,
        handleWorkExperienceSubmit,
      }}
    >
      <div className="w-full h-full p-[3vw] flex-col">
        <ProfileNavBar />
        {isAJob(activeTab) && (
          <div className="mt-[10vw]">
            <Job className="my-auto" />
          </div>
        )}
        {activeTab === "profile" && (
          <div className="mt-[10vw] sm:mt-[10vw] lg:mt-[5vw]">
            <ProfileSection userData={userData} />
          </div>
        )}
        {activeTab === "education" && (
          <div className="mt-[10vw] sm:mt-[10vw] lg:mt-[5vw]">
            <Education userData={userData} />
          </div>
        )}
        {activeTab === "reviews" && (
          <div className="mt-[10vw] sm:mt-[10vw] lg:mt-[5vw]">
            <Review userData={userData} />
          </div>
        )}
        {activeTab === "portfolio" && (
          <div className="mt-[10vw] sm:mt-[10vw] lg:mt-[5vw]">
            <Portfolio userData={userData} />
          </div>
        )}
        {activeTab === "work" && (
          <div className="mt-[10vw] sm:mt-[10vw] lg:mt-[5vw]">
            <WorkExperience userData={userData} />
          </div>
        )}
      </div>
    </VarContext.Provider>
  );
}

export default UserProfile;
