const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    qty: { type: String, required: true, trim: true },
    unit: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const stepSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true, min: 1 },
    text: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const recipeSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    coverUrl: { type: String, trim: true, default: "" },
    cuisine: { type: String, required: true, trim: true, lowercase: true },
    diet: {
      type: String,
      enum: ["none", "vegetarian", "vegan", "keto"],
      default: "none",
    },
    cookTime: { type: Number, required: true, min: 1 },
    servings: { type: Number, required: true, min: 1 },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    ingredients: {
      type: [ingredientSchema],
      required: true,
      validate: [
        (value) => value.length > 0,
        "At least one ingredient is required",
      ],
    },
    steps: {
      type: [stepSchema],
      required: true,
      validate: [(value) => value.length > 0, "At least one step is required"],
    },
    avgRating: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ["published", "hidden"], default: "published" },
  },
  { timestamps: true },
);

recipeSchema.index(
  {
    title: "text",
    description: "text",
    cuisine: "text",
    tags: "text",
    "ingredients.name": "text",
  },
  {
    weights: {
      title: 10,
      tags: 6,
      cuisine: 4,
      "ingredients.name": 3,
      description: 2,
    },
  },
);

module.exports = mongoose.model("Recipe", recipeSchema);
