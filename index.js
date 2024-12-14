import connectDB from "./src/config/db.js";
import { PORT } from "./src/config/env.js";
import { logger } from "./src/config/logger.js";
import { app } from "./app.js";

// Connect to DataBase
connectDB()
  .then(() => {
    app.listen(PORT || 8000, () => {
      logger.info(`⚙️ Server is running at port : ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("MONGO db connection failed !!! ", err);
  });
