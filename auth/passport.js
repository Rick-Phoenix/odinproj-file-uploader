import passport from "passport";
import { checkPassword } from "../../odinproj-file-uploader/auth/passwordUtils.js";
import { Strategy as LocalStrategy } from "passport-local";
import { getUser, getUserFiles } from "../prisma/queries.js";

passport.use(
  new LocalStrategy({ usernameField: "email" }, async function (
    email,
    password,
    done
  ) {
    const user = await getUser(email);
    if (!user) {
      return done(null, false, { message: "User does not exist." });
    }

    const isValid = checkPassword(password, user.phash, user.psalt);

    if (!isValid) return done(null, false, { message: "Incorrect password." });
    else return done(null, user);
  })
);

passport.serializeUser((user, done) => {
  done(null, { email: user.email });
});

passport.deserializeUser(async (serializedUser, done) => {
  const userData = await getUserFiles(serializedUser.email);
  if (!userData) return done(null, false);
  const user = {
    email: userData.email,
    username: userData.username,
    id: userData.id,
    folders: userData.folders,
  };
  return done(null, user);
});

export default passport;
