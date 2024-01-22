import PasswordResetToken from "#/models/passwordResetToken";
import { RequestHandler } from "express";

export const isValidPassResetToken: RequestHandler = async (req, res, next) => {
  const { token, userId } = req.body;

  const resetToken = await PasswordResetToken.findOne({
    owner: userId,
  });
  if (!resetToken) {
    return res
      .status(403)
      .json({ error: "Unauthorized access, Invalid token !" });
  }

  const matched = await resetToken.compareToken(token);

  if (!matched) {
    return res.status(403).json({ error: "Invalid token !" });
  }

  next();
};
