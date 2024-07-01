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
const compression = require("compression");
const helmet = require("helmet");

// Finally create the app object
const app = express();

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const dev_db_url =

// This is the connection string I got from Mongo:
  "mongodb+srv://kevinfboutilier:bKI3lS10W9aFwvRc@locallibrary.o1xynnt.mongodb.net/?retryWrites=true&w=majority&appName=localLibrary";

  
  
  // **********************************************************************************************************************************************************
  // NEW DATABASE PASSWORD^^
  // **********************************************************************************************************************************************************

  // This is the connection string from the lesson plan, but with my details used. I probably should be using the one above.... But that didn't work either
  // "mongodb+srv://kevinfboutilier:AMRPU6oe0Zv8fCKW@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority";
const mongoDB = process.env.MONGODB_URI || dev_db_url;

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

app.use(compression()); // Compress all routes

app.use(express.static(path.join(__dirname, "public")));

// After middleware we add route handling for our previously imported routers
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/catalog", catalogRouter); // Add catalog routes to the middleware chain.

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
