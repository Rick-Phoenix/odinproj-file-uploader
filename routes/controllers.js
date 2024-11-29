import { body, validationResult } from "express-validator";
import { genPassword } from "../auth/passwordUtils.js";
import { createUser } from "../prisma/queries.js";

export const signUpValidation = [
  body("username")
    .isLength({ min: 3, max: 24 })
    .withMessage("Username must be between 3 and 24 characters."),
  body("password")
    .isLength({ min: 8, max: 24 })
    .withMessage("Password must be between 8 and 24 characters."),
  body("passconfirm").custom((value, { req }) => {
    if (value !== req.body.password)
      throw new Error("The passwords do not match.");
    else return true;
  }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.mapped() });
    } else {
      const { username, email } = req.body;
      const user = { username, email, ...genPassword(req.body.password) };

      createUser(user);
      res.redirect("/login");
    }
  },
];

export function checkLogged(req, res, next) {
  if (req.isAuthenticated()) return next();
  else return res.send("Access Denied.");
}
