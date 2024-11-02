const API_BASE_URL = "https://us-central1-hire4change-4d9a9.cloudfunctions.net";
const API_BASE_URL_USER = `${API_BASE_URL}/user`;
const API_BASE_URL_DATABASE = `${API_BASE_URL}/database`;

const API_ENDPOINTS = {
  login: `${API_BASE_URL_USER}/login`,
  add_data: `${API_BASE_URL_USER}/add-data`,
  add_image: `${API_BASE_URL_USER}/add-image`,
  profile: `${API_BASE_URL_USER}/profile`,
  add_portfolio: `${API_BASE_URL_USER}/add-portfolio`,
  add_work_experience: `${API_BASE_URL_USER}/add-work-experience`,
  search_job_listing: `${API_BASE_URL_DATABASE}/search-job-listing`,
  create_job: `${API_BASE_URL_DATABASE}/create-job-listing`,
  fetch_job: `${API_BASE_URL_DATABASE}/fetch-job`,
  apply_job: `${API_BASE_URL_DATABASE}/apply-job`,
  assign_job: `${API_BASE_URL_DATABASE}/assign_job`,
  complete_job: `${API_BASE_URL_DATABASE}/complete-job`,
  message: `${API_BASE_URL_DATABASE}/message`,
  get_conversation: `${API_BASE_URL_DATABASE}/get-conversation`,
  get_all_messages: `${API_BASE_URL_DATABASE}/get-all-messages`,
};

export default API_ENDPOINTS;
