import { Router } from "express";

import {
  CreateUserSchema,
  TokenAndIDValidation,
  UpdatePasswordSchema,
  signInValidationSchema,
} from "#/utils/validationSchema";
import { validate } from "#/middleware/validate";
import {
  create,
  generateForgetPasswordLink,
  grantValid,
  sendReVerificationToken,
  signIn,
  updatePassword,
  verifyEmail,
} from "#/controllers/user";
import { isValidPassResetToken, mustAuth } from "#/middleware/auth";

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
router.post("/sign-in", validate(signInValidationSchema), signIn);

router.post("/is-auth", mustAuth, (req, res) => {
  res.json({ profile: req.user });
});

router.post("/public", (req, res) => {
  res.json({ message: "You're in public route !" });
});

router.post("/private", mustAuth, (req, res) => {
  res.json({ message: "You're in private route !" });
});

export default router;
