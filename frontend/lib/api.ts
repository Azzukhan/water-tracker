// Fallback to the local Django server when NEXT_PUBLIC_API_URL is not set.
// This helps avoid confusing 404 errors during development when the frontend
// tries to call its own API routes instead of the backend.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
