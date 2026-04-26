import App from "./src/App.js";
import config from "./src/config/config.js";
import ConnecttoDb from "./src/config/db.js";

ConnecttoDb();

App.listen(config.PORT,()=>{
    console.log("Server is running on port number", config.PORT);
})
