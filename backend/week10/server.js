// Step -1 import express
const express = require("express");
const cors = require("cors");
const { connection } = require("./db");
const { userRouter } = require("./routes/user.route");
const { noteRouter } = require("./routes/note.route");

// step -2 app create
const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", userRouter);
app.use("/notes", noteRouter);

// Routes/ API
// GET Method: Home Page
app.get("/", (req, res) => {
  res.send({ msg: "Welcome to my application" });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  try {
    await connection;
    console.log("DB connected");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exitCode = 1;
  }
  console.log(`Server started on port ${PORT}`);
});
