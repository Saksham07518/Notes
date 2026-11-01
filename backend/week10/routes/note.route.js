const express = require("express");
const { auth } = require("../middleware/auth.middleware");
const { noteModel } = require("../model/note.model");

const noteRouter = express.Router();

// Get all notes for the logged-in user
noteRouter.get("/", auth, async (req, res) => {
  try {
    const notes = await noteModel.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch {
    res.status(500).json({ msg: "Failed to fetch notes" });
  }
});

// Create a new note
noteRouter.post("/create", auth, async (req, res) => {
  const { title = "Untitled Note", content = "", isFavorite = false, tags = [] } = req.body;
  try {
    const note = await new noteModel({
      title,
      content,
      userId: req.userId,
      isFavorite,
      isTrash: false,
      tags,
    }).save();
    res.json({ msg: "Note created successfully", note });
  } catch {
    res.status(500).json({ msg: "Failed to create note" });
  }
});

// Update a note
noteRouter.patch("/:id", auth, async (req, res) => {
  try {
    const note = await noteModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ msg: "Note not found" });
    res.json({ msg: "Note updated successfully", note });
  } catch {
    res.status(500).json({ msg: "Failed to update note" });
  }
});

// Empty trash
noteRouter.delete("/empty-trash", auth, async (req, res) => {
  try {
    await noteModel.deleteMany({ userId: req.userId, isTrash: true });
    res.json({ msg: "Trash emptied successfully" });
  } catch {
    res.status(500).json({ msg: "Failed to empty trash" });
  }
});

// Permanently delete a single note
noteRouter.delete("/:id", auth, async (req, res) => {
  try {
    const note = await noteModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!note) return res.status(404).json({ msg: "Note not found" });
    res.json({ msg: "Note deleted permanently" });
  } catch {
    res.status(500).json({ msg: "Failed to delete note" });
  }
});

module.exports = { noteRouter };
