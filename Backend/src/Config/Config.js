import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONOGODB_URI is not defined in environment variables");
}
if (!process.env.PORT) {
  throw new Error("PORT is not defined in environment variables");
}

if (!process.env.JWT_TOKEN) {
  throw new Error("JWT TOKEN is not defined in environment variables");
}

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error("Cloudinary Name is not defines in environment variables");
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error("Cloudinary API Key is not defined in environment variables");
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error("Cloudinary Secret is not defined in environment variables");
}

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OpenRouter api key is not defined in environment variables");
}

if (!process.env.HF_TOKEN) {
  throw new Error("Hugging Face api is not defined in environment variables");
}

if (!process.env.HF_IMAGE_MODEL) {
  throw new Error(
    "Hugging Face image model is not defined in environment variables",
  );
}

if (!process.env.FRONTEND_URL) {
  console.warn("FRONTEND_URL is not defined in environment variables.");
}

if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn(
    "GOOGLE_CLIENT_ID is not defined in environment variables. Google Sign-In will not work.",
  );
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.warn(
    "GOOGLE_CLIENT_SECRET is not defined in environment variables. Google Sign-In will not work.",
  );
}

if (!process.env.BACKEND_URL) {
  console.warn(
    "BACKEND_URL is not defined in environment variables. Google callback redirects may be incorrect behind proxies.",
  );
}

const config = {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
  JWT_TOKEN: process.env.JWT_TOKEN,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  HF_TOKEN: process.env.HF_TOKEN,
  HF_IMAGE_MODEL: process.env.HF_IMAGE_MODEL,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  BACKEND_URL: process.env.BACKEND_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

export default config;
