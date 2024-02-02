import express from "express";
import "dotenv/config";
import "express-async-errors";

import "./db";

import authRouter from "./routers/auth";
import audioRouter from "./routers/audio";
import favoriteRouter from "./routers/favorite";
import playlistRouter from "./routers/playlist";
import profileRouter from "./routers/profile";
import historyRouter from "./routers/history";
import "./utils/schedule";
import { errorHandler } from "./middleware/error";

const app = express();

//Register our middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//it will visible to every one
app.use(express.static("src/public"));

app.use("/auth", authRouter);
app.use("/audio", audioRouter);
app.use("/favorite", favoriteRouter);
app.use("/playlist", playlistRouter);
app.use("/profile", profileRouter);
app.use("/history", historyRouter);

//middleware to handle internal server errors
app.use(errorHandler);

const PORT = process.env.PORT || 9999;

app.listen(PORT, () => {
  console.log("Server is running on PORT " + PORT);
});

/**
* The plan and features * upload audio files
* listen to single audio
✶ add to favorites
* create playlist
* remove playlist (public-private)
* remove audios
* many more
**/
