const DEFAULT_API_BASE_URL = "http://user98-backend-alb-1733908966.ap-southeast-1.elb.amazonaws.com";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

export const BOOKS_API_URL = `${API_BASE_URL}/books`;
