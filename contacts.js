const express = require("express");
const mongodb = require("mongodb");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const config = require("./config.js");

const app = express();
let db;

app.use(bodyParser.json());

// Connect to the MongoDB database
mongodb.MongoClient.connect(
  config.mongodbUri,
  { useNewUrlParser: true },
  (err, client) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    // Save the database object for later use
    db = client.db();
    console.log("Connected to MongoDB");
  }
);

// Middleware function to verify JWT token
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// Route to handle requests to upload new contacts
app.post("/contacts", authenticateJWT, (req, res) => {
  const newContact = req.body;
  db.collection("contacts").insertOne(newContact, (err, result) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

// Route to handle requests to retrieve all contacts
app.get("/contacts", authenticateJWT, (req, res) => {
  db.collection("contacts")
    .find({})
    .toArray((err, docs) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        res.send(docs);
      }
    });
});

module.exports = app;
