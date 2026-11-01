const mongoose = require("mongoose");

const noteSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    userId: { type: String, required: true },
    isFavorite: { type: Boolean, default: false },
    isTrash: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const noteModel = mongoose.model("note", noteSchema);
module.exports = { noteModel };
