const express = require("express");
const moo = require("./middleware/toplayer");
const sessionCheck = require("./middleware/sessionMiddleware");
const User = require("./models/user");
const mongoose = require("mongoose");
const session = require("express-session");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const cors = require("cors");
var request = require("request");
const { auth, requiresAuth } = require("express-openid-connect");

require("dotenv").config(".env");

const app = new express();

app.use(express.json());

app.use(cors());

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: "a long, randomly-generated string stored in env",
  baseURL: "http://localhost:3001",
  clientID: "wmQqBoynvHrFGefEXl1yn9R1u5aue66a",
  issuerBaseURL: "https://ras140899.eu.auth0.com",
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get("/", (req, res) => {
  res.send(req.oidc.user || "Not logged in");
});

//app.use(sessionCheck);

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_DOMAIN}.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `${process.env.AUTH0_DOMAIN}`,
  algorithms: ["RS256"],
});

// app.post("/login", async (req, res) => {
//   var options = {
//     method: "POST",
//     url: "https://ras140899.eu.auth0.com/oauth/token",
//     headers: { "content-type": "application/json" },
//     body:
//       '{"client_id":"aAM2ry8I5H2zhnTPSDkm0zPMZy7VIG27","client_secret":"xTTrJKGMCAc4U12_rDi7JLE7M8QAGA5m6pMABRYGoQExjgQ5NIFk9Msv3tBuCqtK","audience":"https://users","grant_type":"client_credentials"}',
//   };

//   request(options, function (error, response, body) {
//     if (error) throw new Error(error);

//     res.status(200).send(body);
//   });
// });

process.on("uncaughtException", function (err) {
  console.log(err);
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

app.get("/users", checkJwt, (req, res) => {
  console.log("Process var: ", process.env.AUTH0_DOMAIN);
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
