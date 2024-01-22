import { isValidObjectId } from "mongoose";
import * as yup from "yup";

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
      "Password is too simple !"
    ),
});
