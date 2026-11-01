const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel } = require("../model/user.model");

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (await userModel.findOne({ email })) {
      return res.status(400).json({ msg: "User already exists with this email" });
    }
    const hash = await bcrypt.hash(password, 5);
    await new userModel({ name, email, password: hash }).save();
    res.json({ msg: "User Registered successfully" });
  } catch {
    res.status(500).json({ msg: "Can't Register successfully" });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User is not Registered" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "Wrong Password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "coding");
    res.json({ msg: "Login Successfully", token, name: user.name });
  } catch {
    res.status(500).json({ msg: "User is not Registered" });
  }
});

module.exports = { userRouter };
