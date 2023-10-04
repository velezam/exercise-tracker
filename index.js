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
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})