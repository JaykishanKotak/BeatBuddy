import { Router } from "express";

import {
  CreateUserSchema,
  TokenAndIDValidation,
  UpdatePasswordSchema,
  SignInValidationSchema,
} from "#/utils/validationSchema";
import { validate } from "#/middleware/validate";
import {
  create,
  generateForgetPasswordLink,
  grantValid,
  logOut,
  sendProfile,
  sendReVerificationToken,
  signIn,
  updatePassword,
  updateProfile,
  verifyEmail,
} from "#/controllers/auth";
import { isValidPassResetToken, mustAuth } from "#/middleware/auth";

import { RequestWithFiles, fileParser } from "#/middleware/fileParser ";

const router = Router();

router.post("/create", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIDValidation), verifyEmail);
router.post("/re-verify-email", sendReVerificationToken);
router.post("/forget-password", generateForgetPasswordLink);
router.post(
  "/verify-pass-reset-token",
  validate(TokenAndIDValidation),
  isValidPassResetToken,
  grantValid
);
router.post(
  "/update-password",
  validate(UpdatePasswordSchema),
  isValidPassResetToken,
  updatePassword
);
router.post("/sign-in", validate(SignInValidationSchema), signIn);

router.post("/is-auth", mustAuth, sendProfile);

router.post("/update-profile", mustAuth, fileParser, updateProfile);

router.post("/logout", mustAuth, logOut);

router.post("/public", (req, res) => {
  res.json({ message: "You're in public route !" });
});

router.post("/private", mustAuth, (req, res) => {
  res.json({ message: "You're in private route !" });
});

export default router;

/*
router.post("/update-profile", async (req, res) => {
  //  'content-type': 'application/json', won't work with formidable
  //only works with "multipart/form-data";
  console.log(req.headers);
  const dir = path.join(__dirname, "../public/profiles");

  try {
    await fs.readdirSync(dir);
  } catch (error) {
    //if no dir => create dir
    await fs.mkdirSync(dir);
  }

  if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
    return res.status(422).json({ error: "Only Accepts form data !" });
  }
  //file upload
  const form = formidable({
    uploadDir: dir,
    filename(name, ext, part, form) {
      return Date.now() + "_" + part.originalFilename;
    },
  });
  form.parse(req, (err, fields, files) => {
    console.log("Fields : ", fields);
    console.log("Files : ", files);
    res.json({ uploaded: true });
  });
});

*/
