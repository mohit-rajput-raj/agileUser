import axios from "axios";

export const axiosApi = axios.create({
  baseURL: process.env.DEVELOPMENT_MODE === "true" ? process.env.BACKEND_URL_LOCAL : process.env.BACKEND_URL_PRODUCTION,
  withCredentials: true,
});