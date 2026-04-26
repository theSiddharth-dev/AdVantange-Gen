import mongoose from "mongoose"
import config from "./config.js";


const ConnecttoDb = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log("Connect to Database")
    } catch (error) {
        console.log("Failed to Connect due to ", error)
    }
}

export default ConnecttoDb;