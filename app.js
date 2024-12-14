import express from "express";
import cors from "cors";
import morgan from "morgan";
import { ORIGIN } from "./src/config/env.js";
import cookieParser from "cookie-parser";
import { logger } from "./src/config/logger.js";
import helmet from "helmet";

//Created The Server
const app = express();

// add Due to Security Purpose
app.use(helmet());

// used for access from fronted from different origin
app.use(
  cors({
    origin: ORIGIN,
    Credential: true, // allow only that user which is providing cookie
  })
);

// used to accept request in json
app.use(express.json({ limit: "16kb" }));

// used to convert url in normmal form and extract parms from the URL
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// storing the files and pdfs in the browser
app.use(express.static("public"));

// used to parse Cookie
app.use(cookieParser());

// used For HTTP Request Logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

//routes import
import userRouter from "./src/routes/user.routes.js";

app.use("/api/v1/users", userRouter);

export { app };
