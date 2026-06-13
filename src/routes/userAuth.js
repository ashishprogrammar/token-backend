const express = require("express");
const verifyAccessToken = require("../utils/AccessToken");
const {
  register,
  login,
  refresh,
  logout,
  forgot,
  reset,
} = require("../controllers/userAuth");
const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.get("/profile", verifyAccessToken, (req, res) => {
  console.log(req.user);
  res.json({
    userId: req.user._id,
  });
});

authRouter.post("/refresh", refresh);

//Login
authRouter.post("/login", login);

authRouter.post("/logout", logout);

authRouter.post("/forgotPassword", forgot);

authRouter.post("/resetPassword/:token", reset);

module.exports = authRouter;
