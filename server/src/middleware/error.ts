import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  //To handle error inside apis => response code will be 500 as it is internal error
  if (err) {
    return res.status(500).json({ error: err.message });
  }
};
