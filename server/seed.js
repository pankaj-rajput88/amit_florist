import "dotenv/config";
import mongoose from "mongoose";
import Product from "./models/Product.js";
import { products } from "../src/data/products.js";

await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
if ((await Product.countDocuments()) === 0) {
  await Product.insertMany(products.map(({ id, ...rest }) => rest));
  console.log("Sample bouquets added");
} else {
  console.log("Database me pehle se bouquets hain, kuch nahi badla");
}
await mongoose.disconnect();