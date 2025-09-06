export const API_BASE =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL ||
      `${window.location.protocol}//${window.location.hostname}:8080`
    : process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
