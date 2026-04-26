import dotenv from "dotenv";

dotenv.config();

if(!process.env.MONGODB_URI){
    throw new Error("MONOGODB_URI is not defined in environment variables")
}
if(!process.env.PORT){
    throw new Error("PORT is not defined in environment variables")
}

if(!process.env.JWT_TOKEN){
    throw new Error("JWT TOKEN is not defined in environment variables")
}

const config = {
    MONGODB_URI: process.env.MONGODB_URI,
    PORT : process.env.PORT,
    JWT_TOKEN : process.env.JWT_TOKEN
}

export default config