import axios from "axios";

export const axiosApi = axios.create({
  baseURL: import.meta.env.MODE === "development" ? process.env.BACKEND_URL_LOCAL : process.env.BACKEND_URL_PRODUCTION,
  withCredentials: true,
});