import { router } from "../trpc.js";
import { signup } from "./signup.js";
import { login } from "./login.js";
import { signout } from "./signout.js";
import { me } from "./me.js";
import { createPassword } from "./createPassword.js";
import { requestPasswordReset } from "./requestPasswordReset.js";
import { resetPassword } from "./resetPassword.js";
import { requestEmailVerification } from "./requestEmailVerification.js";
import { verifyEmail } from "./verifyEmail.js";

export const authRouter = router({
  signup,
  login,
  signout,
  me,
  createPassword,
  requestPasswordReset,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
});
