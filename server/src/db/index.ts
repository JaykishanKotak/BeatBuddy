import mongoose from "mongoose";
import { MONGO_URI } from "#/utils/variables";

const URI = MONGO_URI;

// mongoose.set("strictQuery", true);

mongoose
  .connect(URI)
  .then(() => {
    console.log("Database Connected Successfully !!!");
  })
  .catch((err) => {
    console.log("Something Went Wrong, DB Connection Failed !!! ", err);
  });
