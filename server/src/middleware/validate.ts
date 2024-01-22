import { RequestHandler } from "express";
import * as yup from "yup";

export const validate = (schema: any): RequestHandler => {
  return async (req, res, next) => {
    if (!req.body)
      return res.status(422).json({ error: "Empty body is not excepeted !" });
    /*
        whenever we run this method, our schema is going to create new object and we are going to add everything inside this body.
        
        if we want to validate this using this create user schema, then what we need to do, we need to pass all these things.
        We have to pass this inside this validate method and they are going to be name, email and the password, right?

        EX : req.body
            newSchema.validate(){
                body : {
                    name,
                    email,
                    password
                }
            }  

        These are the things that we have to pass inside our validate method to validate our user schema.
        But we'll have name, email and password inside our request dot body.

        EX : newSchema.validate(){
                body : req.body
            }  

        So what if we convert our user schema to the new schema? Where we are going to have everything inside this new object called body.

        Now here you can see we have our name, email and password inside this new object called body.
    */
    const schemaToValidate = yup.object({
      body: schema,
    });
    try {
      /** abortEarly : true =>  this means is if we found any problem inside our schema, then we don't want to wait for rest of the other validation. */
      await schemaToValidate.validate({ body: req.body }, { abortEarly: true });
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        res.status(422).json({ error: error.message });
      }
    }
  };
};
