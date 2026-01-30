import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/userModel.js";
import generateUserId from "../utils/generateUserId.js";
import sendEmail from "../utils/sendEmail.js";
import { generateToken } from "../utils/tokenUtils.js";

/* ================= SIGNUP ================= */
export const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await generateUserId(firstName, lastName);

    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userId
    });

    await sendEmail({
        to: email,
        subject: "Welcome to EduPath",
        html: `
      <h3>Hello ${firstName} ${lastName}</h3>
      <p>Your EduPath Account has been created successfully.</p>
      <p><b>User ID:</b> ${userId}</p>
    `
    });

    res.status(201).json({
        token: generateToken(user._id),
        user
    });
};

/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
        token: generateToken(user._id),
        user
    });
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
        to: user.email,
        subject: "Password Reset",
        html: `<p>Reset your password:</p><a href="${resetUrl}">Reset Password</a>`
    });

    res.json({ message: "Reset link sent to email" });
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
    const resetToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
};
