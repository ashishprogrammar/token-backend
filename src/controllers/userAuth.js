const User = require("../models/users");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const register = async (req, res) => {
  try {
    //validate the data
    validate(req.body);

    const { firstName, emailId, password } = req.body;

    //check first whether email id is created or not but u already defined unique

    const userExists = await User.exists({
      emailId: emailId.toLowerCase().trim(),
    });

    if (userExists) {
      throw new Error("User already exists");
    }

    req.body.password = await bcrypt.hash(password, 10);
    //abb user ko do bhejo login pe ya data access

    //difference between new User() and User.create()

    const user = await User.create(req.body);

    // const token = jwt.sign(
    //   { _id: user._id, emailId: emailId },
    //   process.env.JWT_KEY,
    //   {
    //     expiresIn: 60 * 60,
    //   },
    // );

    // res.cookie("token", token, { maxAge: 60 * 60 * 1000 }); //maxage ya expired: new Date(now) maxage millisecond me kaam karta hai

    res.status(201).send("User Registered Sucessfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId) {
      throw new Error("Invalid Credential");
    }

    if (!password) {
      throw new Error("Invalid Password");
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      throw new Error("Register First");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new Error("Wrong Password");
    }

    const generateAccessToken = jwt.sign(
      { _id: user._id, emailId: emailId },
      process.env.ACCESS_JWT_KEY,
      { expiresIn: "5m" },
    );

    const generateRefreshToken = jwt.sign(
      { _id: user._id, emailId: emailId },
      process.env.REFRESH_JWT_KEY,
      { expiresIn: "7d" },
    );

    user.refreshToken = generateRefreshToken;

    await user.save();

    res.cookie("accesstoken", generateAccessToken, {
      maxAge: 5 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.cookie("refresstoken", generateRefreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.status(200).send("Logged In Successfully");
  } catch (err) {
    res.status(401).send("Error: " + err);
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  console.log(refreshToken);

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token missing",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_KEY);
    console.log(decoded);

    const user = await User.findOne({ emailId: decoded.emailId });
    console.log(user);

    console.log("DB Token:", user.refreshToken);
    console.log("Equal ?", refreshToken === user.refreshToken);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        message: "Logging again",
      });
    }

    const newAccessToken = jwt.sign(
      { _id: user._id, emailId: user.emailId },
      process.env.ACCESS_JWT_KEY,
      { expiresIn: "5m" },
    );

    res.cookie("accesstoken", newAccessToken, {
      maxAge: 5 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

const logout = async (req, res) => {
  const { userId } = req.body;

  await User.findByIdAndUpdate(userId, {
    refreshToken: null,
  });

  res.clearCookie("accesstoken");
  res.clearCookie("refresstoken");

  res.json({
    message: "Logged out",
  });
};

const forgot = async (req, res) => {
  const { emailId } = req.body;

  if (!emailId) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  const user = await User.findOne({
    emailId,
  });

  if (!user) {
    return res.status(404).json({
      message: "User Not Found",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  await user.save();

  const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

  const Html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background:#2563eb;padding:30px;">
              <h1 style="color:#ffffff;margin:0;">Password Reset Request</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 30px;color:#333333;">
              <h2 style="margin-top:0;">Hello,</h2>

              <p style="font-size:16px;line-height:1.6;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>

              <div style="text-align:center;margin:35px 0;">
                <a
                  href="${resetLink}"
                  style="
                    background:#2563eb;
                    color:#ffffff;
                    text-decoration:none;
                    padding:14px 28px;
                    border-radius:8px;
                    font-size:16px;
                    font-weight:bold;
                    display:inline-block;
                  "
                >
                  Reset Password
                </a>
              </div>

              <p style="font-size:15px;line-height:1.6;">
                This link will expire in <strong>15 minutes</strong>.
              </p>

              <p style="font-size:15px;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

              <p style="font-size:13px;color:#6b7280;word-break:break-all;">
                If the button doesn't work, copy and paste this link into your browser:
                <br />
                ${resetLink}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background:#f9fafb;padding:20px;color:#6b7280;font-size:12px;">
              © ${new Date().getFullYear()} Your App Name. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  // sending to email

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.emailId,
    subject: "Password Reset",
    html: Html,
  });

  res.json({
    message: "Reset Link sent successfully",
  });
};

const reset = async (req, res) => {
  try {
    const { token } = req.params;
    console.log(token);
    const { newPassword } = req.body;
    console.log(newPassword);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = { register, login, refresh, logout, forgot, reset };
