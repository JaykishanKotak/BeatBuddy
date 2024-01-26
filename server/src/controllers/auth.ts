import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { isValidObjectId } from "mongoose";

import { CreateUser, VerifyEmailRequest } from "#/@types/user";
import {
  CreateUserSchema,
  TokenAndIDValidation,
} from "#/utils/validationSchema";
import User from "#/models/user";
import EmailVerificationToken from "#/models/emailVerificationToken";
import PasswordResetToken from "#/models/passwordResetToken";
import { formatProfile, genrateOTPToken } from "#/utils/helper";
import {
  sendForgetPasswordLink,
  sendPasswordResetSuccessEmail,
  sendVerificationMail,
} from "#/utils/mail";
import crypto from "crypto";
import { JWT_SECRET, PASSWORD_RESET_LINK } from "#/utils/variables";
import { RequestWithFiles } from "#/middleware/fileParser ";
import cloudinary from "#/cloud";
import formidable from "formidable";

export const create: RequestHandler = async (req: CreateUser, res) => {
  const { name, email, password } = req.body;
  //   const newUser = new User({
  //     name,
  //     email,
  //     password,
  //   });
  //   newUser.save()
  CreateUserSchema.validate({ name, email, password }).catch((error) => {});

  const newUser = await User.create({ name, email, password });

  //send verifiationEail
  const token = genrateOTPToken();

  await EmailVerificationToken.create({
    owner: newUser._id,
    token: token,
  });

  sendVerificationMail(token, {
    name: newUser.name,
    email: newUser.email,
    userId: newUser._id.toString(),
  });

  res.status(201).json({
    user: { name: newUser.name, email: newUser.email, userId: newUser._id },
  });
};

export const verifyEmail: RequestHandler = async (
  req: VerifyEmailRequest,
  res
) => {
  const { token, userId } = req.body;
  const verificationToken = await EmailVerificationToken.findOne({
    owner: userId,
  });

  if (!verificationToken) {
    return res.status(403).json({ error: "Invalid token !" });
  }

  const matched = await verificationToken.compareToken(token);
  if (!matched) {
    return res.status(403).json({ error: "Invalid token !" });
  }

  await User.findByIdAndUpdate(userId, {
    verified: true,
  });

  await EmailVerificationToken.findByIdAndDelete(verificationToken._id);

  res.json({ message: "Your Email is verified !" });
};

export const sendReVerificationToken: RequestHandler = async (req, res) => {
  const { userId } = req.body;

  if (!isValidObjectId(userId)) {
    return res.status(403).json({ error: "Invalid request !" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(403).json({ error: "Invalid request !" });
  }

  //Remove perivious token
  await EmailVerificationToken.findOneAndDelete({
    owner: userId,
  });

  const token = genrateOTPToken();

  await EmailVerificationToken.create({
    owner: userId,
    token,
  });

  sendVerificationMail(token, {
    name: user.name,
    email: user.email,
    userId: user._id.toString(),
  });

  res.json({ message: "Please check your mail !" });
};

export const generateForgetPasswordLink: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(404).json({ error: "Account not found !" });
  }

  await PasswordResetToken.findOneAndDelete({
    owner: user._id,
  });

  const token = crypto.randomBytes(36).toString("hex");
  //genrate the link
  //httl://sampleurl.com/forget-password?token="token"&userId="userId"
  await PasswordResetToken.create({
    owner: user._id,
    token,
  });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  sendForgetPasswordLink({ email: user.email, link: resetLink });
  res.json({ message: "Please check your mail !" });
};

export const isValidPassResetToken: RequestHandler = async (req, res) => {
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

  res.json({ message: "Your token is valid !" });
};

export const grantValid: RequestHandler = async (req, res) => {
  res.json({ valid: true });
};

export const updatePassword: RequestHandler = async (req, res) => {
  const { password, userId } = req.body;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(403).json({ error: "Unauthorized access !" });
  }

  const matched = await user.comparePassword(password);

  if (matched) {
    return res
      .status(422)
      .json({ error: "The new password must be different !" });
  }

  user.password = password;

  await user.save();

  //Remove token
  await PasswordResetToken.findOneAndDelete({
    owner: user._id,
  });

  sendPasswordResetSuccessEmail(user.name, user.email);
  res.json({ message: "Password reset successfully." });
};

export const signIn: RequestHandler = async (req, res) => {
  const { password, email } = req.body;

  const user = await User.findOne({
    email,
  });

  //If no User
  if (!user) {
    return res.status(403).json({ error: "Email/Password mismatch !" });
  }

  const matched = await user.comparePassword(password);

  if (!matched) {
    return res.status(403).json({ error: "Email/Password mismatch !" });
  }

  //genrate jwt token for later use.
  const jwtToken = jwt.sign({ userId: user._id }, JWT_SECRET);
  user.tokens.push(jwtToken);

  await user.save();

  res.json({
    profile: {
      id: user._id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      avatar: user.avatar?.url,
      followers: user.followers.length,
      followings: user.followings.length,
    },
    token: jwtToken,
  });
};

export const updateProfile: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  const { name } = req.body;

  const avatar = req.files?.avatar as formidable.File;

  const user = await User.findById(req.user.id);

  if (!user) throw new Error("Something went wrong, user not found !");

  if (typeof name !== "string") {
    return res.status(422).json({ error: "Invalid name !" });
  }

  if (name.trim().length < 3) {
    return res.status(422).json({ error: "Invalid name !" });
  }

  user.name = name;

  if (avatar) {
    //if already file, remove
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar?.publicId);
    }
    //upload new avatar file
    const { secure_url, url, public_id } = await cloudinary.uploader.upload(
      avatar.filepath,
      {
        width: 300,
        height: 300,
        crop: "thumb",
        gravity: "face",
      }
    );

    user.avatar = {
      url: secure_url,
      publicId: public_id,
    };
  }

  await user.save();
  res.json({
    message: "Profile updated successfully.",
    profile: formatProfile(user),
  });
};

export const sendProfile: RequestHandler = async (req, res) => {
  res.json({ profile: req.user });
};

export const logOut: RequestHandler = async (req, res) => {
  const { fromAll } = req.query;

  const token = req.token;
  const user = await User.findById(req.user.id);

  if (!user) throw new Error("Something went wrong, user not found !");

  //logout from alll devices
  // "auth/logout?fromAll=yes"
  if (fromAll === "yes") {
    user.tokens = [];
  } else {
    user.tokens = user.tokens.filter((t) => t != token);
  }

  await user.save();
  res.json({ success: true });

  //logout from single device
};
