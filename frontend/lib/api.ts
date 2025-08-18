// Fallback to the local Django server when NEXT_PUBLIC_API_URL is not set.
// This helps avoid confusing 404 errors during development when the frontend
// tries to call its own API routes instead of the backend.
export const API_BASE =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL ||
      `${window.location.protocol}//${window.location.hostname}:8080`
    : process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
