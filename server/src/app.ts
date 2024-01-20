import express from "express";
import "dotenv/config";
import "./db";

const app = express();

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
