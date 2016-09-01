"use strict";

require("dotenv").config();
var express = require("express");
var mongoose = require("mongoose");
var routes = require("./app/routes/index.js");
var passport = require("passport");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var jwt = require("jwt-simple");
var User = require("./app/models/user.js");
var Poll = require("./app/models/polls.js");
var compression = require("compression");
require("./app/config/passport")(passport);

var app = express();

app.use(compression());
app.use("/public", express.static(process.cwd() + "/public"));
app.use(morgan("dev")); //log requests
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize());

mongoose.connect(process.env.MONGOLAB_URI);

var db = mongoose.connection;



db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
	console.log("Successfully connected to MongoDB");
	routes(app, passport, User, Poll, jwt, process.env.SECRET);
});


app.listen(process.env.PORT);
console.log("server is running on "+process.env.PORT);