import express from "express";
import cors from "cors";
import morgan from "morgan";
import { ORIGIN } from "./src/config/env.js";
import cookieParser from "cookie-parser";
import { logger } from "./src/config/logger.js";
import helmet from "helmet";
import { errorHandler } from "./src/middleware/error.middleware.js";

//Created The Server
const app = express();

// add Due to Security Purpose
app.use(helmet());

// used for access from fronted from different origin
app.use(
  cors({
    origin: ORIGIN,
    credentials: true, // allow only that user which is providing cookie
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
import videoRouter from "./src/routes/video.routes.js";
import commentRouter from "./src/routes/comment.routes.js";
import tweetRouter from "./src/routes/tweet.routes.js";
import playlistRouter from "./src/routes/playlist.routes.js";
import likeRouter from "./src/routes/like.routes.js";

const startRoute = "/api/v1/";

app.use(`${startRoute}users`, userRouter);
app.use(`${startRoute}video`, videoRouter);
app.use(`${startRoute}comment`, commentRouter);
app.use(`${startRoute}tweet`, tweetRouter);
app.use(`${startRoute}playlist`, playlistRouter);
app.use(`${startRoute}like`, likeRouter);

//global Error Handler
app.use(errorHandler);

export { app };
