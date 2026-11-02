import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";

const router = Router();

// Ek IP se 15 minute me 20 koshish (password guess karne se rokta hai)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts. Try again later." },
});

// Customer ka token. role:"customer" ki wajah se ye admin routes me kaam nahi karega
const sign = (user) =>
  jwt.sign({ uid: user._id, role: "customer" }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, phone: u.phone });
const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e);

// ---------- SIGNUP ----------
router.post("/signup", limiter, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim().slice(0, 20);
    const password = String(req.body.password || "");

    if (!name || !emailOk(email)) {
      return res.status(400).json({ error: "Please enter a valid name and email" });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: "Password must be 8 to 72 characters" });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    // Password ko hash karke save karte hain, asli password kabhi nahi
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, phone, password: hash });

    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "An account with this email already exists" });
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ---------- LOGIN ----------
router.post("/login", limiter, async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email }).select("+password");
    const ok = user && (await bcrypt.compare(password, user.password));

    // Email galat ho ya password, message ek hi, taaki koi email guess na kar sake
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    res.json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ---------- Guard: sirf logged-in customer ----------
export function requireUser(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    const d = jwt.verify(token, process.env.JWT_SECRET);
    if (d.role !== "customer") throw new Error("not a customer token");
    req.userId = d.uid;
    next();
  } catch {
    res.status(401).json({ error: "Please log in" });
  }
}

// ---------- Mera profile ----------
router.get("/me", requireUser, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ error: "Please log in" });
  res.json({ user: publicUser(user) });
});

export default router;