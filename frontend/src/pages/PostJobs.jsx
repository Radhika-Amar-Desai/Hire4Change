import React, { useState } from "react";
import API_ENDPOINTS from "../config/apiConfig";

function separateValues(inputString) {
  return inputString
    .split(/[\s,]+/) // Split by whitespace or commas
    .filter((value) => value); // Filter out empty values
}

const JobForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewJobSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    // Check if user is logged in
    const username = localStorage.getItem("username");
    if (!username) {
      alert("User not logged in");
      return;
    }

    setIsSubmitting(true); // Set submitting state to true to disable the button

    // Construct job data
    const newJobData = {
      publisher: username,
      title: e.target.newJobTitle.value,
      description: e.target.newJobDescription.value,
      category: e.target.newJobCategory.value,
      fromDateTime: e.target.newJobStartDate.value,
      toDateTime: e.target.newJobEndDate.value,
      location: {
        address: e.target.newJobLocationAddress.value,
        city: e.target.newJobLocationCity.value,
        state: e.target.newJobLocationState.value,
        country: e.target.newJobLocationCountry.value,
        pincode: e.target.newJobLocationPincode.value,
      },
      priceQuote: {
        amount: e.target.newJobPriceQuoteValue.value,
        currency: "INR",
        rateType: e.target.newJobPriceQuoteOption.value,
      },
      skillsRequired: separateValues(e.target.newJobSkillsRequired.value),
      keywords: separateValues(e.target.newJobKeywords.value),
      applicationDeadline: e.target.newJobApplicationDeadline.value,
    };

    try {
      // Send form data to server
      const response = await fetch(API_ENDPOINTS.create_job, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newJobData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("New Job posted successfully!");
      } else {
        alert("Error posting new job: " + result.error);
      }
    } catch (error) {
      console.error("Error Submitting New Job:", error);
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <form onSubmit={handleNewJobSubmit} className="flex-col flex justify-end p-[5vw]">
      <input
        name="newJobTitle"
        type="text"
        placeholder="Title"
        className="border p-2 mb-2"
        required
      />
      <input
        name="newJobDescription"
        placeholder="Description"
        className="border p-2 mb-2"
        required
      />
      <input
        name="newJobKeywords"
        placeholder="Keywords (separated by whitespace or comma)"
        className="border p-2 mb-2"
        required
      />
      <input
        name="newJobSkillsRequired"
        type="text"
        placeholder="Skills (separated by whitespace or comma)"
        className="border p-2 mb-2"
      />
      <input
        name="newJobCategory"
        type="text"
        placeholder="Job Category"
        className="border p-2 mb-2"
        required
      />
      <div className="flex space-x-[4vw]">
        <div className="flex space-x-4 mb-4">
          <label className="text-gray-400">Start Date:</label>
          <input type="date" name="newJobStartDate" />
        </div>
        <div className="flex space-x-4 mb-4">
          <label className="text-gray-400">End Date:</label>
          <input type="date" name="newJobEndDate" />
        </div>
      </div>
      <input
        name="newJobLocationAddress"
        type="text"
        placeholder="Address"
        className="border p-2 mb-2"
      />
      <input
        name="newJobLocationCity"
        type="text"
        placeholder="City"
        className="border p-2 mb-2"
      />
      <input
        name="newJobLocationState"
        type="text"
        placeholder="State"
        className="border p-2 mb-2"
      />
      <input
        name="newJobLocationCountry"
        type="text"
        placeholder="Country"
        className="border p-2 mb-2"
      />
      <input
        name="newJobLocationPincode"
        type="text"
        placeholder="Pincode"
        className="border p-2 mb-2"
      />
      <div className="flex space-x-4">
        <input
          name="newJobPriceQuoteValue"
          type="text"
          placeholder="Price Quote"
          className="border p-2 mb-2"
        />
        <div className="mt-2 flex space-x-4">
          <label>
            <input type="radio" name="newJobPriceQuoteOption" value="daily" /> Daily Rate
          </label>
          <label>
            <input type="radio" name="newJobPriceQuoteOption" value="hourly" /> Hourly Rate
          </label>
          <label>
            <input type="radio" name="newJobPriceQuoteOption" value="monthly" /> Monthly Rate
          </label>
        </div>
      </div>
      <div className="flex space-x-4 mb-4">
        <label className="text-gray-400">Application Deadline:</label>
        <input type="date" name="newJobApplicationDeadline" />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white mt-4 py-2 px-4 rounded"
      >
        {isSubmitting ? "Submitting..." : "Add Portfolio Item"}
      </button>
    </form>
  );
};

function PostJobs() {
  return (
    <div>
      <div className="sm:text-[4vw] lg:text-[2vw] font-semibold flex justify-center">
        Post A New Job
      </div>
      <JobForm />
    </div>
  );
}

export default PostJobs;
