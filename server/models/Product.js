import mongoose from "mongoose";

// Ek bouquet database me kaisa dikhega
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    desc: { type: String, trim: true, maxlength: 500, default: "" },
    image: { type: String, trim: true, default: "" },
    tag: { type: String, trim: true, default: "" }, // "Latest" ya "Best seller"
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);