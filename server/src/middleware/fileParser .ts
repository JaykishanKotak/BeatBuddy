import { RequestHandler, Request } from "express";
import formidable, { File } from "formidable";

export interface RequestWithFiles extends Request {
  files?: { [key: string]: File };
}

export const fileParser: RequestHandler = async (
  req: RequestWithFiles,
  res,
  next
) => {
  if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
    return res.status(422).json({ error: "Only Accepts form data !" });
  }

  const form = formidable({
    multiples: false,
  });
  const [fields, files] = await form.parse(req);

  console.log("Fields : ", fields);
  console.log("Files : ", files);

  //Fields :  { Name: [ 'John' ] }
  for (let key in fields) {
    const field = fields[key];
    if (field) {
      //req.body["name"] = "John"
      req.body[key] = field[0];
    }
  }

  for (let key in files) {
    const file = files[key];
    if (!req.files) {
      req.files = {};
    }

    if (file) {
      req.files[key] = file[0];
    }
  }

  next();
};
