import { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } from "#/utils/variables";

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
  //secure: true Creates URL With HTTPS
  secure: true,
});

export default cloudinary;
