import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Product from "./models/Product.js";

const app = express();
app.use(cors({ origin: (process.env.CLIENT_URL || "http://localhost:5173").split(",") }));
app.use(express.json());
app.set("trust proxy", 1); // Render ke liye

app.get("/", (req, res) => res.json({ status: "ok", message: "Florist backend is running" }));

// ---------- PUBLIC: sabko dikhne wale bouquets ----------
app.get("/api/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }); // naye pehle
  res.json(products);
});

// ---------- ADMIN ----------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many attempts. Try again later." },
});

app.post("/api/admin/login", loginLimiter, (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Wrong password" });
  }
  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: "4h" });
  res.json({ token });
});

// Guard: sahi token ho tabhi aage jane do
function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Not authorized" });
  }
}

// Body se sirf allowed fields lo (extra cheezein ignore)
const pick = (b) => ({
  name: b.name,
  price: Number(b.price),
  category: b.category,
  desc: b.desc,
  image: b.image,
  tag: b.tag,
  inStock: b.inStock,
});

function valid(data) {
  return data.name && data.category && Number.isFinite(data.price) && data.price >= 0;
}

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  const data = pick(req.body);
  if (!valid(data)) return res.status(400).json({ error: "Name, price and category are required" });
  res.status(201).json(await Product.create(data));
});

app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
  const data = pick(req.body);
  if (!valid(data)) return res.status(400).json({ error: "Name, price and category are required" });
  const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Koi bhi error aaye to server crash nahi hoga
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection failed:", err.message));