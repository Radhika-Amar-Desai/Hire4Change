import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ASSETS from "../config/assetsConfig";
import API_ENDPOINTS from "../config/apiConfig";
import { FaComment, FaComments } from 'react-icons/fa';

function Gig() {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPublisher, setIsPublisher] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [assignedApplicant, setAssignedApplicant] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const userId = localStorage.getItem("username");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.fetch_job + `/${id}`);
        console.log(response);
        if (!response.ok) throw new Error("Job not found");
        const result = await response.json();
        setData(result);
        setIsLoading(false);

        if (result.publisher === userId) {
          setIsPublisher(true);
          setApplicants(result.applicants || []);
          setAssignedApplicant(result.assigned || "");
          setIsCompleted(result.status !== "open");
        }
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, userId]);

  const applyForJob = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.apply_job, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantUsername: userId, jobID: id }), // Corrected line
      });

      console.log(response);
      console.log({ applicantUsername: userId, jobID: id });

      if (!response.ok)
        throw new Error("You have already applied or job is completed");

      setModalMessage("You have successfully applied for this job!");
      setShowModal(true);
    } catch (error) {
      setModalMessage(error.message);
      setShowModal(true);
    }
  };

  const assignJob = async (jobId, applicantUsername) => {
    try {
      const response = await fetch(API_ENDPOINTS.assign_job, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: applicantUsername, jobId: jobId }),
      });

      console.log(response);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to assign the job");
      }

      setAssignedApplicant(applicantUsername);
      setModalMessage("Job assigned successfully!");
      setShowModal(true);
    } catch (error) {
      setModalMessage(error.message);
      setShowModal(true);
    }
  };

  const completedJob = async (jobId, applicantUsername) => {
    try {
      const response = await fetch(API_ENDPOINTS.complete_job, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: jobId,
          applicantUsername: applicantUsername,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to complete the job");
      }

      setIsCompleted(true);
      setModalMessage("Job completed successfully!");
      setShowModal(true);
    } catch (error) {
      setModalMessage(error.message);
      setShowModal(true);
    }
  };

  if (isLoading)
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-600">{error}</div>;

  const profilePicURL = localStorage.getItem("profilePicURL");

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <h1 className="text-6xl font-bold mb-4 text-gray-800">
            {data.title}
          </h1>

          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-2">
              {profilePicURL? <img
                className="w-16 h-16 rounded-full border border-gray-300"
                src={profilePicURL}
                alt="User"/>:  <img
              className="w-16 h-16 rounded-full border border-gray-300"
              src={ASSETS.defaultProfilePic}
              alt="User"
            />}
              <span className="text-xl font-semibold text-gray-700">
                {data.publisher}
              </span>
            </div>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() =>
                navigate("/messages", {
                  state: { userId: userId, receiver: data.publisher },
                })
              }
            >
              <h1 className="text-xl font-bold pr-1">chat</h1>
              <FaComment size = {30}
        className="text-black" // Tailwind for width, height, and border color
        style={{
          fill: 'white',    // Fill color (white inside)
          stroke: 'black',  // Border color
          strokeWidth: '20' // Border thickness
        }}
      />
              {/* <FaComment size={30} color="white"/> */}
              {/* <i className="ri-chat-3-line ri-2x"></i> */}
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-2 text-gray-800">
            About This Gig
          </h2>
          <p className="text-gray-700 mb-6">{data.description}</p>

          <h2 className="text-2xl font-semibold mb-2 text-gray-800">
            Job Details
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-gray-300 rounded-lg shadow-lg">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-600">Status</td>
                  <td className="py-2 px-4 text-gray-800">{data.status}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-600">Type</td>
                  <td className="py-2 px-4 text-gray-800">{data.type}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-600">Posted By</td>
                  <td className="py-2 px-4 text-gray-800">{data.publisher}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-600">
                    Estimated Duration
                  </td>
                  <td className="py-2 px-4 text-gray-800">
                    {data.estimatedDuration}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-600">Skills Required</td>
                  <td className="py-2 px-4 text-gray-800">
                    {data.skillsRequired.join(", ")}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-600">Price Quote</td>
                  <td className="py-2 px-4 text-gray-800">{`${data.priceQuote.currency} ${data.priceQuote.amount} (${data.priceQuote.rateType})`}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {!isPublisher && !isCompleted && (
            <div className="mt-6">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                onClick={applyForJob}
              >
                Apply for Job
              </button>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/3 bg-gray-100 p-4 rounded-lg shadow-lg">
          <div className="mb-4 flex flex-col">
            <img className="rounded-lg mb-10" src={data.images[0]} alt="Gig" />
            <h2 className="text-2xl font-bold text-green-600 flex justify-between">
              <span className="text-zinc-600">Price:</span>
              <span>INR {data.priceQuote.amount}</span>
            </h2>
          </div>
          <div className="flex flex-row gap-2">
            {data.keywords.map((keyword, index) => (
              <div
                key={index}
                className="bg-gray-200 p-2 px-3 opacity-65 font-semibold rounded-full flex justify-center items-center text-nowrap text-gray-700"
              >
                {keyword}
              </div>
            ))}
          </div>

          {isPublisher && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Applicants:</h3>
              <ul>
                {applicants.length === 0 ? (
                  <li className="text-gray-600">No applicants yet</li>
                ) : (
                  applicants.map((applicant, index) => (
                    <li
                      key={index}
                      className="mb-2 flex justify-between items-center text-gray-800"
                    >
                      {applicant}
                      {isCompleted && assignedApplicant === applicant ? (
                        <span className="text-green-600 font-semibold">
                          Completed
                        </span>
                      ) : assignedApplicant === applicant ? (
                        <div>
                          <button
                            className="ml-4 px-2 py-1 rounded-lg shadow-md transition duration-400 bg-green-600 text-white"
                            disabled={true}
                          >
                            Assigned
                          </button>
                          <button
                            className="ml-4 px-2 py-1 rounded-lg shadow-md transition duration-400 bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => completedJob(id, applicant)}
                          >
                            Mark Completed
                          </button>
                        </div>
                      ) : !isCompleted ? (
                        <button
                          className="ml-4 px-2 py-1 rounded-lg shadow-md transition duration-400 bg-gray-300 text-gray-700 hover:bg-gray-400"
                          onClick={() => assignJob(id, applicant)}
                        >
                          Assign
                        </button>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg mb-4 text-gray-800">{modalMessage}</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
              onClick={() => setShowModal(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gig;
