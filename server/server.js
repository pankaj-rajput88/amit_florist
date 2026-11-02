import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import multerCloudinary from "multer-storage-cloudinary";
import Product from "./models/Product.js";
import authRoutes from "./routes/auth.js";

const { CloudinaryStorage } = multerCloudinary;

// ---------- Cloudinary ----------
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const upload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "florist", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

// ---------- App ----------
const app = express();
app.set("trust proxy", 1); // Render ke liye
app.use(cors({ origin: (process.env.CLIENT_URL || "http://localhost:5173").split(",") }));
app.use(express.json());
app.use("/api/auth", authRoutes);

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
    const d = jwt.verify(token, process.env.JWT_SECRET);
    if (!d.admin) throw new Error("not admin"); // customer token admin nahi ban sakta
    next();
  } catch {
    res.status(401).json({ error: "Not authorized" });
  }
}

// Body se sirf allowed fields lo (extra cheezein ignore)
const pick = (b, file) => {
  const data = {
    name: b.name,
    price: Number(b.price),
    category: b.category,
    desc: b.desc,
    tag: b.tag,
    // FormData me sab string aata hai, isliye "true"/"false" ko boolean banao
    inStock: b.inStock === undefined ? undefined : b.inStock === true || b.inStock === "true",
    // nayi file mili to wo, warna purana link (agar bheja ho)
    image: file ? file.path : b.image,
  };
  // undefined fields hata do, taaki edit me purani value overwrite na ho
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
  return data;
};

function valid(data) {
  return data.name && data.category && Number.isFinite(data.price) && data.price >= 0;
}

// requireAdmin pehle, upload baad me (bina login wale upload nahi kar paayenge)
app.post("/api/admin/products", requireAdmin, upload.single("image"), async (req, res) => {
  const data = pick(req.body, req.file);
  if (!valid(data)) return res.status(400).json({ error: "Name, price and category are required" });
  res.status(201).json(await Product.create(data));
});

app.put("/api/admin/products/:id", requireAdmin, upload.single("image"), async (req, res) => {
  const data = pick(req.body, req.file);
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
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "Image 5MB se choti honi chahiye" : err.message });
  }
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