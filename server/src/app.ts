import express from "express";
import "dotenv/config";
import "./db";

import authRouter from "./routers/auth";

const app = express();

//Register our middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//it will visible to every one
app.use(express.static("src/public"));

app.use("/auth", authRouter);

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
