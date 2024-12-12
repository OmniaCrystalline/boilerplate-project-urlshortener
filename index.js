/** @format */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

function isValidWebAddress(string) {
  const regex = /^(https?:\/\/|www\.)/;
  return regex.test(string);
}

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO);
  console.log("mongo is connected");
}

const schema = new Schema({
  original_url: String,
  short_url: Number,
});

const Pair = new model("Pair", schema);

function isValidWebAddress(string) {
  const regex = /^(https?:\/\/|www\.)/;
  return regex.test(string);
}

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json()); // For parsing application/x-www-form-urlencoded

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.use("/public", express.static(`${process.cwd()}/public`));

let n = 0;
let data = {};

app.post("/api/shorturl", function (req, res) {
  const { url } = req.body;

  if (!isValidWebAddress(url)) {
    res.json({ error: "invalid url" });
    return;
  }

  const search = Pair.findOne({ original_url: url })
    .select("-_id -__v")
    .catch((err) => res.json({ message: err.message }));
  
  const findLength = Pair.find().countDocuments().catch(err=> err.message)

  search.then((finden) => {
    if (finden) {
      res.json({ finden });
    }
    return;
  });

  const create = findLength
    .then((res) => (n = res + 1))
    .then(() => Pair.create({ original_url: url, short_url: n }))
    .then(res => data = res)
    .catch((err) => console.log("err after create", err));

  create.then((data) => {
    res.json({original_url: data.original_url, short_url: data.short_url})
  });
});


app.get("/api/shorturl/:short_url", (req, res) => {
  const { short_url } = req.params;
  const result = Pair.findOne({ short_url: Number(short_url) }).then(res => data = res).catch(e => console.log('e', e))
  const regex = /^(https?:\/\/)/
  regex.test(data.original_url)
  result.then(() => res.redirect(data.original_url))
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
