/* Server for New-Scraper app for the UTA Boot Camp */

// Dependencies
const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

// Path static location
app.use(express.static("public"));

const connection = require("./config/connection");

const routes = require("./controllers/newsRoutes.js");

app.use(routes);

app.listen(PORT, function() {
  console.log("Server listening at port " + PORT);
});
