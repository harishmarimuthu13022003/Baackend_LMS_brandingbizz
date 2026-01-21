const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });

    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    // Default to "user" if role not provided, otherwise use the provided role
    const userRole = role && ["admin", "user"].includes(role) ? role : "user";

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role: userRole });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
};

