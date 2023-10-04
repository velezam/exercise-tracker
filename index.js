const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

// connect database
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// setup schemas
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  }
})

const exerciseSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  description: String,
  duration: Number,
  date: String
})

const User = mongoose.model("User", userSchema)
const Exercise = mongoose.model("Exercise", exerciseSchema)

app.use(cors())
app.use(express.static('public'))

// add parsing for json and url for POST method
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Create new user
app.post("/api/users", async function(req, res) {
  let username = req.body.username

  if (!username) {
    res.json({ error: "No username entered" })
  }

  // see if user already exists
  let user = await User.findOne({ username: username })

  // if username does not exist, create new user and send response
  if (!user) {
    let newUser = await User.create({
      username: username
    })

    res.json({
      username: newUser.username,
      _id: newUser._id
    })

  } else {
    // send user that was found
    res.json({
      username: user.username,
      _id: user._id
    })
  }
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})