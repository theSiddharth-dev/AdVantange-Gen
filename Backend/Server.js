import App from "./src/App.js";
import config from "./src/Config/Config.js";
import ConnecttoDb from "./src/Config/Db.js";

ConnecttoDb();

App.listen(config.PORT, () => {
  console.log("Server is running on port number", config.PORT);
});
