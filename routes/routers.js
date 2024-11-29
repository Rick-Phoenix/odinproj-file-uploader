import { Router } from "express";
import { checkLogged, signUpValidation } from "./controllers.js";
import passport from "../auth/passport.js";
import { findFolder, getUsers } from "../prisma/queries.js";

export const router = Router();

router.use("/app", checkLogged);

router.get("/", (req, res) => res.render("index"));
router.get("/signup", (req, res) => res.render("signup"));
router.get("/login", (req, res) => res.render("login"));
router.get("/app", (req, res) => res.render("app", { user: req.user }));

router.get("/app/:folder", async (req, res) => {
  const currentFolder = await findFolder(req.user.id, req.params.folder);
  if (!currentFolder) return res.send("This folder does not exist.");
  res.render("folder", { user: req.user, folder: currentFolder });
});

router.post("/app/create", (req, res) => {
  res.render("newFolder", {});
});

router.post("/signup", signUpValidation);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/app",
    failureRedirect: "/login",
  })
);
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});
