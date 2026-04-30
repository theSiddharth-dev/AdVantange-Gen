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

if(!process.env.OPENROUTER_API_KEY){
  throw new Error("OpenRouter api key is not defined in environment variables")
}


const config = {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
  JWT_TOKEN: process.env.JWT_TOKEN,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
};

export default config;
