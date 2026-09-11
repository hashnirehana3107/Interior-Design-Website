// Central API configuration
// In production on Vercel: uses relative path '' so requests go to same Vercel domain (/api/...)
// In local development: Vite proxy redirects /api to http://localhost:5000
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
