import axios from "axios";

export const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const URLS = {
  lists: `${baseURL}/lists`,
};
