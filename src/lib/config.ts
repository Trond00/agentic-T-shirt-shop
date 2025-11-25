export const config = {
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 
           process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
           "http://localhost:3000",
  apiURL: process.env.NEXT_PUBLIC_API_URL || 
          process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api` : 
          "http://localhost:3000/api",
};