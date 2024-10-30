import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ItemCard from "../components/itemCard/ItemCard.jsx";
import axios from "axios";
import API_ENDPOINT from "../config/apiConfig.js";

function Search() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearchQuery = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [activeFilters, setActiveFilters] = useState({
    searchQuery: initialSearchQuery,
    city: "",
    minPrice: "",
    maxPrice: "",
  });

  const [sortBy, setSortBy] = useState("postedDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);

    const data = {
      query: activeFilters.searchQuery.trim(),
      filters: {},
      sort_by: sortBy,
      sort_order: sortOrder,
    };

    if (activeFilters.city.trim())
      data.filters.city = activeFilters.city.trim();
    if (activeFilters.minPrice.trim())
      data.filters.min_price = Number(activeFilters.minPrice);
    if (activeFilters.maxPrice.trim())
      data.filters.max_price = Number(activeFilters.maxPrice);

    try {
      const response = await axios.post(API_ENDPOINT.search_job_listing, data);
      setJobs(response.data.results);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch jobs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a search query.");
      return;
    }
    setActiveFilters({
      searchQuery,
      city,
      minPrice,
      maxPrice,
    });
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc"); // Default to descending when changing sortBy
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeFilters, sortBy, sortOrder]);

  return (
    <div className="w-full">
      <div className="container mx-auto p-4">
        {/* Search and Filters */}
        <form onSubmit={handleApply} className="mb-6">
          <div className="flex flex-col md:flex-row md:space-x-4">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 mb-2 md:mb-0 flex-initial"
            />
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border p-2 mb-2 md:mb-0 flex-1"
            />
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="border p-2 mb-2 md:mb-0 flex-1"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="border p-2 mb-2 md:mb-0 flex-1"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Apply
            </button>
          </div>
        </form>

        {/* Sorting Options */}
        <div className="flex justify-between items-center mb-6">
          <span className="font-bold">Sort by:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSortChange("postedDate")}
              className={`px-4 py-2 rounded ${
                sortBy === "postedDate"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Posted Date{" "}
              {sortBy === "postedDate" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSortChange("priceQuote.amount")}
              className={`px-4 py-2 rounded ${
                sortBy === "priceQuote.amount"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Price{" "}
              {sortBy === "priceQuote.amount" &&
                (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSortChange("estimatedDuration")}
              className={`px-4 py-2 rounded ${
                sortBy === "estimatedDuration"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Duration{" "}
              {sortBy === "estimatedDuration" &&
                (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>
        </div>

        {/* Warning Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Job Listings */}
        <div className="cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <h1 className="text-2xl text-blue-900 font-bold uppercase w-full text-center">
              Loading...
            </h1>
          ) : error ? (
            <h1 className="text-2xl text-red-700 font-bold uppercase w-full text-center">
              OOPS, Something went wrong!
            </h1>
          ) : jobs.length > 0 ? (
            jobs.map((job) => <ItemCard key={job._id} item={job}/>)
          ) : (
            <h1 className="text-2xl text-gray-700 font-semibold w-full text-center">
              No jobs found. Try adjusting your search criteria.
            </h1>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
