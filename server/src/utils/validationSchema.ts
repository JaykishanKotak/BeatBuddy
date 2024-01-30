import e from "express";
import { isValidObjectId } from "mongoose";
import * as yup from "yup";
import { categories } from "./audio_category";

export const CreateUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name is missing !")
    .min(3, "Name is too short !")
    .max(20, "Name is too long !"),
  email: yup
    .string()
    .email("Invalid email Id !")
    .required("Email is missing !"),
  password: yup
    .string()
    .trim()
    .required("Password is missing !")
    .min(8, "Password is too short")
    .max(24, "Password is too long !")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
      "Password is too simple !"
    ),
});

export const TokenAndIDValidation = yup.object().shape({
  token: yup.string().required("Invalid token !"),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("Invalid User ID"),
});

export const UpdatePasswordSchema = yup.object().shape({
  token: yup.string().required("Invalid token !"),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("Invalid User ID"),
  password: yup
    .string()
    .trim()
    .required("Password is missing !")
    .min(8, "Password is too short")
    .max(24, "Password is too long !")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
      "Password is too simple, please use alphanumeric with special characters !"
    ),
});

export const SignInValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email Id !")
    .required("Email is missing !"),
  password: yup.string().trim().required("Password is missing !"),
});

export const AudioValidationSchema = yup.object().shape({
  title: yup.string().required("Title is missing !"),
  about: yup.string().required("About is missing !"),
  category: yup
    .string()
    .oneOf(categories, "Invalid category !")
    .required("Category is missing !"),
});

/**
 * While create playlist - there can be request with
 * 1. with new playlist name and the audio that user wants to store inside the playlist.
 * 2. or user just want to create an emptyy playlist.
 */
export const NewPlaylistValidationSchema = yup.object().shape({
  title: yup.string().required("Title is missing !"),
  resId: yup.string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : "";
  }),
  visibility: yup
    .string()
    .oneOf(["public", "private"], "Visibility must be public or private !")
    .required("Visibility is missing !"),
});

export const OldPlaylistValidationSchema = yup.object().shape({
  title: yup.string().required("Title is missing !"),

  //validate audioId
  item: yup.string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : "";
  }),

  //validate playlistId
  id: yup.string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : "";
  }),

  visibility: yup
    .string()
    .oneOf(["public", "private"], "Visibility must be public or private !"),
  // .required("Visibility is missing !"),
});
