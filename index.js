const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// connect database
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// setup schemas
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  exercises: [
    {
      type: {
        description: String,
        duration: Number,
        date: String,
      },
      required: false,
    },
  ],
});

const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(express.static("public"));

// add parsing for json and url for POST method
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// formats json output into more tree-like structure
app.set("json spaces", 2);

// Create new user
app.post("/api/users", async function (req, res) {
  let username = req.body.username;

  if (!username) {
    res.json({ error: "Username is required" });
    return;
  }

  let user = await User.findOne({ username: username });

  if (!user) {
    let newUser = await User.create({
      username: username,
    });

    res.json({
      username: newUser.username,
      _id: newUser._id,
    });

    return;
  }

  res.json({
    username: user.username,
    _id: user._id,
  });
});

// Get list of all users
app.get("/api/users", async function (req, res) {
  let users = await User.find({}).select("id username");
  res.json(users);
});

// Create exercise
app.post("/api/users/:_id/exercises", async (req, res) => {
  const id = req.params._id;
  const { description, duration, date } = req.body;

  let user = await User.findById(id);

  if (!user) {
    res.json({ error: "Could not find user" });
    return;
  }

  user.exercises.push({
    username: user.username,
    description: description,
    duration: +duration,
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  });

  await user.save();

  res.json({
    username: user.username,
    description: description,
    duration: +duration,
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    _id: user._id,
  });
});

// Get user's exercise log
app.get("/api/users/:_id/logs", async (req, res) => {
  const id = req.params._id;
  const { from, to, limit } = req.query;

  let user = await User.findById(id);

  if (!user) {
    res.json({ error: "Could not find user" });
    return;
  }

  let exercises = user.exercises.map((exercise) => {
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
    };
  });

  if (from) {
    var fromDate = new Date(from);
    exercises = exercises.filter((exercise) => new Date(exercise.date) >= fromDate);
  }

  if (to) {
    var toDate = new Date(to);
    exercises = exercises.filter((exercise) => new Date(exercise.date) <= toDate);
  }

  if (limit) {
    exercises = exercises.slice(0, +limit);
  }

  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log: exercises,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
