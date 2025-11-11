import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    end_year: { type: String, default: "" },
    intensity: { type: Number },
    sector: { type: String },
    topic: { type: String },
    insight: { type: String },
    url: { type: String },
    region: { type: String },
    start_year: { type: String, default: "" },
    impact: { type: String, default: "" },
    added: { type: String }, // keeping as string since it looks like a formatted date
    published: { type: String },
    country: { type: String },
    relevance: { type: Number },
    pestle: { type: String },
    source: { type: String },
    title: { type: String },
    likelihood: { type: Number }
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
