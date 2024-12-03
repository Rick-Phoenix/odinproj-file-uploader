import { Router } from "express";
import { checkLogged, signUpValidation } from "./controllers.js";
import passport from "../auth/passport.js";
import {
  addFile,
  createFolder,
  deleteFile,
  deleteFolder,
  findFolder,
  getFileById,
  getUsers,
  renameFolder,
} from "../prisma/queries.js";

import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

export const router = Router();

router.use("/app", checkLogged);

router.get("/", (req, res) => res.render("index"));
router.get("/signup", (req, res) => res.render("signup"));
router.get("/login", (req, res) => res.render("login"));
router.get("/app", (req, res) => res.render("app", { user: req.user }));

router.get("/app/upload", (req, res) => {
  if (!req.user.folders.length)
    return res.send("You must create a folder before uploading any files.");
  res.render("upload", { folders: req.user.folders });
});

router.get("/app/:folderId", async (req, res) => {
  const currentFolder = await findFolder(req.user.id, req.params.folderId);
  if (!currentFolder) return res.send("This folder does not exist.");
  console.log(currentFolder);
  res.render("folder", { user: req.user, folder: currentFolder });
});

router.get("/app/rename/:folderId", async (req, res) => {
  const folder = await findFolder(req.user.id, req.params.folderId);
  if (!folder) return res.send("This folder does not exist.");
  res.render("rename", { folder: folder });
});

router.get("/app/file/:fileId", async (req, res) => {
  const file = await getFileById(+req.params.fileId);
  if (!file)
    return res.send(
      "This file does not exist or is not available for this user."
    );
  const folder = req.user.folders.find(
    (folder) => folder.id === file.folderId
  ).name;
  res.render("file", { file: file, folder: folder });
});

router.post("/app/file/:fileId", (req, res) => {
  deleteFile(+req.body.fileId);
  res.redirect("/app");
});

router.post("/app/upload", upload.single("file"), (req, res) => {
  console.log(req.body, req.file);
  const fileData = {
    userId: +req.user.id,
    folderId: +req.body.folderId,
    name: req.file.originalname,
    url: req.file.path,
    size: req.file.size,
  };
  addFile(fileData);
  res.redirect("/app/upload");
});

router.post("/app/rename/:folderId", (req, res) => {
  renameFolder(req.user.id, req.params.folderId, req.body.name);
  res.redirect("/app");
});

router.post("/app/create/:parentFolderId", (req, res) => {
  res.render("newFolder", { parentFolderId: req.params.parentFolderId });
});

router.post("/app/add", async (req, res) => {
  if (req.body.parentFolderId) {
    const checkParent = await findFolder(req.user.id, req.body.parentFolderId);
    if (!checkParent)
      return res.send("The parent folder selected does not exist.");
  }

  createFolder(req.user.id, req.body.name, req.body.parentFolderId);
  res.redirect("/app");
});

router.post("/app/removeFolder", (req, res) => {
  deleteFolder(req.user.id, req.body.id);
  res.redirect("/app");
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
