// First we import (require) useful node libraries that we already downloaded using npm
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Then we import our routers from the routes folder. Currently 2 routes.
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const catalogRouter = require("./routes/catalog"); //import routes for "catalog" area of site

// Finally create the app object
var app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB =
  "mongodb+srv://kevinfboutilier:AMRPU6oeOZv8fCKW@locallibrary.o1xynnt.mongodb.net/?retryWrites=true&w=majority&appName=localLibrary";

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// Use our app object to set up the view (template) engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// These functions add the middleware libraries that we imported above into the request handling chain.
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// After middleware we add route handling for our previously imported routers
app.use("/", indexRouter);
app.use("/users", usersRouter);
// app.use("/catalog", catalogRouter); Add catalog routes to the middleware chain.

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

//  ************************************************************************************************************************************************************************
// Connection string for mongoDB:
// mongodb+srv://kevinfboutilier:AMRPU6oe0Zv8fCKW@locallibrary.o1xynnt.mongodb.net/?retryWrites=true&w=majority&appName=localLibrary
//  ************************************************************************************************************************************************************************


// populated mongodb with: 
// node populatedb 'mongodb+srv://kevinfboutilier:AMRPU6oe0Zv8fCKW@locallibrary.o1xynnt.mongodb.net/?retryWrites=true&w=majority&appName=localLibrary'



