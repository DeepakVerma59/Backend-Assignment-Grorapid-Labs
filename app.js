const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const config = require('./config/db')

const postRoute = require("./routes/api")

require('./config/passport')(passport);
mongoose.connect(config.db, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

app.get('/', function (req, res) {
  res.send('Page under construction.');
});


app.use('/api', postRoute)

app.listen(3000, ()=>{
  console.log("Server running on port 3000")
})