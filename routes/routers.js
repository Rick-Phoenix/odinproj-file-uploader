import { Router } from "express";
import { checkLogged, signUpValidation } from "./controllers.js";
import passport from "../auth/passport.js";
import {
  createFolder,
  deleteFolder,
  findFolder,
  getUsers,
} from "../prisma/queries.js";

export const router = Router();

router.use("/app", checkLogged);

router.get("/", (req, res) => res.render("index"));
router.get("/signup", (req, res) => res.render("signup"));
router.get("/login", (req, res) => res.render("login"));
router.get("/app", (req, res) => res.render("app", { user: req.user }));

router.get("/app/:folderId", async (req, res) => {
  const currentFolder = await findFolder(req.user.id, req.params.folderId);
  if (!currentFolder) return res.send("This folder does not exist.");
  res.render("folder", { user: req.user, folder: currentFolder });
});

router.post("/app/create/:parentFolderId", (req, res) => {
  res.render("newFolder", { parentFolderId: req.params.parentFolderId });
});

router.post("/app/add", async (req, res) => {
  console.log(req.body);
  const checkParent = await findFolder(req.user.id, req.body.parentFolderId);
  if (!checkParent)
    return res.send("The parent folder selected does not exist.");
  else {
    createFolder(req.user.id, req.body.name, req.body.parentFolderId);
    res.redirect("/app");
  }
});

router.post("/app/removeFolder", (req, res) => {
  deleteFolder(req.user.id, req.body.id);
  res.redirect("/");
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
