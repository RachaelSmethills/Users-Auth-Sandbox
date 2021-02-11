const express = require("express");
const moo = require("./middleware/toplayer");
const User = require("./models/user");
const mongoose = require("mongoose");

const app = new express();

app.use(express.json());

app.use(moo);

mongoose.connection.on("connecting", () => {
  console.log("Doing my best..");
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongodb");
});

mongoose.connect(
  "mongodb+srv://user:Pa55word1@cluster0.s0rwr.mongodb.net/test",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.put("/users/:id", (req, res) => {
  User.findOneAndUpdate({ _id: req.params.id }, req.body, (error, doc) => {
    if (!doc) {
      res.status(404).send("Couldn't find user.");
    } else {
      res.status(200).send("User updated - source: trust me");
    }
  });
});

app.get("/users", (req, res) => {
  User.find({}, (error, results) => {
    if (!results) {
      res.status(404).send("Nah boii");
    } else {
      res.status(200).send(results);
    }
  });
});

app.delete("/users/:id", (req, res) => {
  console.log("Hunting..");
  User.findOneAndDelete({ _id: req.params.id }, (error, results) => {
    if (!results) {
      res.status(404).send("Nah boii");
    } else {
      res.status(200).send("Deleted: " + results);
    }
  });
});

app.get("/users/:id", (req, res) => {
  console.log("Hunting..");
  User.findById(req.params.id, (error, results) => {
    if (!results) {
      res.status(404).send("Nah boii");
    } else {
      res.status(200).send(results);
    }
  });
});

app.post("/users", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  user.save().then((data) => {
    res.status(200).send("Created User");
  });
});

app.listen(3001, () => {
  console.log("App listening on port 3001");
});
