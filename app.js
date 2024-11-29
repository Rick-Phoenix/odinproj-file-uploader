import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { join } from "node:path";
const __dirname = import.meta.dirname;
import session from "express-session";
import { PrismaClient } from "@prisma/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import passport from "./auth/passport.js";
import { router } from "./routes/routers.js";
const app = express();

app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    secret: "to lol or to lmao",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.session());

app.use((req, res, next) => {
  console.log("MW", req.user);
  next();
});
app.use(router);

app.listen(3000);
