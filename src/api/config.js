const DEFAULT_API_BASE_URL = "http://13.214.156.69:8080";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

export const BOOKS_API_URL = `${API_BASE_URL}/books`;
