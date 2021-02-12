const express = require("express");
const moo = require("./middleware/toplayer");
const sessionCheck = require("./middleware/sessionMiddleware");
const User = require("./models/user");
const mongoose = require("mongoose");
const basicAuth = require("express-basic-auth");
const session = require("express-session");

const app = new express();

app.use(express.json());

app.use(sessionCheck);

const basicAuthConst = {
  authorizer: myAsyncAuthorizer,
  authorizeAsync: true,
  unauthorizedResponse: (req) => {
    return `401 not authorised`;
  },
};

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

function myAsyncAuthorizer(un, pass, cb) {
  console.log("Authing: ", un, pass);
  User.findOne({ username: un, password: pass }, (error, results) => {
    if (!results) {
      return cb(null, false);
    } else {
      return cb(null, true);
    }
  });
}

app.post("/login", basicAuth(basicAuthConst), function (req, res, next) {
  if (!req.session.userId) {
    User.findOne(
      { username: req.auth.user, password: req.auth.password },
      (error, results) => {
        if (!results) {
          res.status(304).send(`Query Failed.. how`);
        } else {
          req.session.userId = `${results._id}`;
          res.status(200).send(`All Good - ${results._id}`);
        }
      }
    );
  }
});

app.get("/logout", function (req, res, next) {
  req.session.destroy(() => {
    res.status(200).send("Logged out");
  });
});

app.get("/", function (req, res, next) {
  if (req.session.views) {
    req.session.views++;
    res.setHeader("Content-Type", "text/html");
    res.write("<p>views: " + req.session.views + "</p>");
    res.write("<p>expires in: " + req.session.cookie.maxAge / 1000 + "s</p>");
    res.end();
  } else {
    req.session.views = 1;
    res.end("welcome to the session demo. refresh!");
  }
});

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
