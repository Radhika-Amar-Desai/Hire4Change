import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config/apiConfig";

function Register() {
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    country: "",
    phoneNumber: "",
    userType: [],
    location: "",
    skills: [],
    languages: [],
    education: [
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        from: "",
        to: "",
      },
    ],
    workExperience: [
      {
        company: "",
        position: "",
        from: "",
        to: "",
      },
    ],
    portfolioItems: [
      {
        title: "",
        description: "",
        link: "",
      },
    ],
    isSeller: false,
    desc: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSeller = (e) => {
    setUser((prev) => ({
      ...prev,
      isSeller: e.target.checked,
    }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setUser((prev) => ({ ...prev, skills }));
  };

  const handleLanguagesChange = (e) => {
    const languages = e.target.value.split(",").map((lang) => lang.trim());
    setUser((prev) => ({ ...prev, languages }));
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    const updatedEducation = [...user.education];
    updatedEducation[index][name] = value;
    setUser((prev) => ({ ...prev, education: updatedEducation }));
  };

  const handleExperienceChange = (e, index) => {
    const { name, value } = e.target;
    const updatedExperience = [...user.workExperience];
    updatedExperience[index][name] = value;
    setUser((prev) => ({ ...prev, workExperience: updatedExperience }));
  };

  const handlePortfolioChange = (e, index) => {
    const { name, value } = e.target;
    const updatedPortfolio = [...user.portfolioItems];
    updatedPortfolio[index][name] = value;
    setUser((prev) => ({ ...prev, portfolioItems: updatedPortfolio }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (step === 1) {
      // Validate fields for Step 1
      if (!user.username) newErrors.username = "Username is required";
      if (!user.email) newErrors.email = "Email is required";
      if (!user.password) newErrors.password = "Password is required";
    } else if (step === 2) {
      // Validate fields for Step 2
      if (!user.phoneNumber) newErrors.phoneNumber = "Phone number is required";
      if (!user.country) newErrors.country = "Country is required";
      if (!user.location) newErrors.location = "Location is required";
    } else if (step === 3) {
      // Validate fields for Step 3
      if (!user.skills.length)
        newErrors.skills = "At least one skill is required";
      if (!user.languages.length)
        newErrors.languages = "At least one language is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateForm()) setStep(step + 1);
  };

  const prevStep = (e) => {
    e.preventDefault();
    setStep(step - 1);
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log(errors);
      return;
    }

    const {
      username,
      email,
      phoneNumber,
      password,
      userType,
      location,
      desc,
      skills,
      languages,
      education,
      workExperience,
      portfolioItems,
      isSeller,
    } = user;

    let base64Image = "";
    if (file) {
      base64Image = await toBase64(file);
    }
    let imageUrl = "";
    try {
      const imageResponse = await fetch(API_ENDPOINTS.add_image, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: [{ image: base64Image }] }),
      });

      const imageResult = await imageResponse.json();
      if (imageResponse.ok) {
        imageUrl = imageResult.urls[0];
        alert("Image uploaded successfully!");
      } else {
        alert("Image upload failed.");
        return;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Image upload failed.");
      return;
    }

    const userData = {
      username,
      email,
      phoneNumber,
      passwordHash: password,
      userType: isSeller ? "Employer" : "Freelancer",
      location: { city: location },
      bio: desc,
      skills,
      languages,
      education,
      workExperience,
      portfolioItems,
      profilePictureUrl: imageUrl,
      ratings: { asEmployer: null, asFreelancer: null },
      completedJobs: [],
      activeJobs: [],
      savedJobs: [],
      createdAt: new Date(),
      lastActive: new Date(),
      isVerified: false,
      verificationDocuments: [],
      isSeller: isSeller,
    };

    try {
      const response = await fetch(API_ENDPOINTS.add_data, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("User registered successfully!");
        navigate("/login");
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex justify-center items-center h-full bg-gray-100">
      <form className="w-full h-full max-w-4xl bg-white shadow-md rounded-lg p-8 my-[4vw]">
        {step === 1 && (
          <>
            <h1 className="text-2xl font-semibold mb-6">
              Step 1: Basic Information
            </h1>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              name="username"
              type="text"
              placeholder="johndoe"
              className="w-full p-2 border rounded mb-4"
              value={user.username}
              onChange={handleChange}
            />
            {errors.username && (
              <p className="text-red-500">{errors.username}</p>
            )}

            <label className="block mb-2 text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="email@example.com"
              value={user.email}
              className="w-full p-2 border rounded mb-4"
              onChange={handleChange}
            />
            {errors.email && <p className="text-red-500">{errors.email}</p>}

            <label className="block mb-2 text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={user.password}
              className="w-full p-2 border rounded mb-4"
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-red-500">{errors.password}</p>
            )}
            <div className="flex items-center mb-4">
              <label className="text-sm font-medium text-gray-600 mr-4">
                Activate Freelancer account
              </label>
              <input
                type="checkbox"
                className="w-6 h-6"
                checked={user.isSeller}
                onChange={handleSeller}
              />
            </div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Profile Picture
            </label>
            <input
              type="file"
              className="w-full p-2 border rounded mb-4"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button
              className="bg-blue-500 text-white font-bold py-2 px-4 mt-6 rounded hover:bg-blue-600"
              onClick={handleNext}
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-semibold mb-6">
              Step 2: Contact Information
            </h1>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Phone Number
            </label>
            <input
              name="phoneNumber"
              type="text"
              placeholder="+1 234 567 89"
              value={user.phoneNumber}
              className="w-full p-2 border rounded mb-4"
              onChange={handleChange}
            />

            <label className="block mb-2 text-sm font-medium text-gray-600">
              Country
            </label>
            <input
              name="country"
              type="text"
              placeholder="Country"
              value={user.country}
              className="w-full p-2 border rounded mb-4"
              onChange={handleChange}
            />

            <label className="block mb-2 text-sm font-medium text-gray-600">
              Location
            </label>
            <input
              name="location"
              type="text"
              placeholder="City"
              value={user.city}
              className="w-full p-2 border rounded mb-4"
              onChange={handleChange}
            />
            {errors.location && (
              <p className="text-red-500">{errors.location}</p>
            )}

            <div className="flex justify-between">
              <button
                className="bg-gray-500 text-white font-bold py-2 px-4 mt-6 rounded hover:bg-gray-600"
                onClick={prevStep}
              >
                Back
              </button>
              <button
                className="bg-blue-500 text-white font-bold py-2 px-4 mt-6 rounded hover:bg-blue-600"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="h-full">
            <h1 className="text-2xl font-semibold mb-6">
              Step 3: Skills, Education, and Experience
            </h1>

            <label className="block mb-2 text-sm font-medium text-gray-600">
              Skills
            </label>
            <input
              name="skills"
              type="text"
              value={user.skills}
              placeholder="Comma-separated skills"
              className="w-full p-2 border rounded mb-4"
              onChange={handleSkillsChange}
            />
            {errors.skills && <p className="text-red-500">{errors.skills}</p>}

            <label className="block mb-2 text-sm font-medium text-gray-600">
              Languages
            </label>
            <input
              name="languages"
              type="text"
              value={user.languages}
              placeholder="Comma-separated languages"
              className="w-full p-2 border rounded mb-4"
              onChange={handleLanguagesChange}
            />
            {errors.languages && (
              <p className="text-red-500">{errors.languages}</p>
            )}

            <h2 className="text-lg font-medium mt-4 mb-2">Education</h2>
            {user.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600">
                  Institution
                </label>
                <input
                  name="institution"
                  type="text"
                  placeholder="Institution"
                  className="w-full p-2 border rounded mb-2"
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(e, index)}
                />

                <label className="block mb-1 text-sm font-medium text-gray-600">
                  Degree
                </label>
                <input
                  name="degree"
                  type="text"
                  placeholder="Degree"
                  className="w-full p-2 border rounded mb-2"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(e, index)}
                />

                <label className="block mb-1 text-sm font-medium text-gray-600">
                  Field of Study
                </label>
                <input
                  name="fieldOfStudy"
                  type="text"
                  placeholder="Field of Study"
                  className="w-full p-2 border rounded mb-2"
                  value={edu.fieldOfStudy}
                  onChange={(e) => handleEducationChange(e, index)}
                />

                <div className="flex space-x-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      From
                    </label>
                    <input
                      name="from"
                      type="date"
                      className="w-full p-2 border rounded"
                      value={edu.from}
                      onChange={(e) => handleEducationChange(e, index)}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      To
                    </label>
                    <input
                      name="to"
                      type="date"
                      className="w-full p-2 border rounded"
                      value={edu.to}
                      onChange={(e) => handleEducationChange(e, index)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <h2 className="text-lg font-medium mt-4 mb-2">Work Experience</h2>
            {user.workExperience.map((exp, index) => (
              <div key={index} className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600">
                  Company
                </label>
                <input
                  name="company"
                  type="text"
                  placeholder="Company"
                  className="w-full p-2 border rounded mb-2"
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(e, index)}
                />

                <label className="block mb-1 text-sm font-medium text-gray-600">
                  Position
                </label>
                <input
                  name="position"
                  type="text"
                  placeholder="Position"
                  className="w-full p-2 border rounded mb-2"
                  value={exp.position}
                  onChange={(e) => handleExperienceChange(e, index)}
                />

                <div className="flex space-x-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      From
                    </label>
                    <input
                      name="from"
                      type="date"
                      className="w-full p-2 border rounded"
                      value={exp.from}
                      onChange={(e) => handleExperienceChange(e, index)}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      To
                    </label>
                    <input
                      name="to"
                      type="date"
                      className="w-full p-2 border rounded"
                      value={exp.to}
                      onChange={(e) => handleExperienceChange(e, index)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <h2 className="text-lg font-medium mt-4 mb-2">Portfolio Items</h2>
            {user.portfolioItems.map((item, index) => (
              <div key={index} className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600">
                  Title
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="Project Title"
                  className="w-full p-2 border rounded mb-2"
                  value={item.title}
                  onChange={(e) => handlePortfolioChange(e, index)}
                />

                <label className="block mb-1 text-sm font-medium text-gray-600">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Project Description"
                  className="w-full p-2 border rounded mb-2"
                  value={item.description}
                  onChange={(e) => handlePortfolioChange(e, index)}
                />

                <label className="block mb-1 text-sm font-medium text-gray-600">
                  Link
                </label>
                <input
                  name="link"
                  type="url"
                  placeholder="Project Link"
                  className="w-full p-2 border rounded mb-2"
                  value={item.link}
                  onChange={(e) => handlePortfolioChange(e, index)}
                />
              </div>
            ))}

            <div className="flex justify-between">
              <button
                className="bg-gray-500 text-white font-bold py-2 px-4 mt-6 rounded hover:bg-gray-600"
                onClick={prevStep}
              >
                Back
              </button>
              <button
                className="bg-blue-500 text-white font-bold py-2 px-4 mt-6 rounded hover:bg-blue-600"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default Register;
