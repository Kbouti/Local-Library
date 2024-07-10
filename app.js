// First we import (require) useful node libraries that we already downloaded using npm
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// Then we import our routers from the routes folder. Currently 2 routes.
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const catalogRouter = require("./routes/catalog"); //import routes for "catalog" area of site
const compression = require("compression");
const helmet = require("helmet");
const dotenv = require("dotenv").config();

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

//

// *********************************************************************************************************
// We're getting an error related to helmet's contentSecurityPolicy (csp). Below is my attempt to turn that feature off, it didn't work. Still got the same error.
// Since this is the only error we're getting I think it's why it won't deploy on glitch.
// If we fix this and it still won't deploy then perhaps we try railway.
// **NOTE:**
// Error isn't consistent? for a while it was only showing in "all authors" page. ???

// From the debugger:
// Error while fetching an original source: unsupported protocol for sourcemap request webpack:///src/contentScripts/prepareInjection.js

// Things I tried but that didn't work:

// app.use(helmet())

// app.use(
//   helmet({
//     contentSecurityPolicy: false
//   })
// );

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net", "script-src-elem", "elem", "webpack:///src/contentScripts/prepareInjection.js"],
//     },
//   })
// );

// **********************************************************************************************************************************************************

// Connection string template for Odin cluster:
// mongodb+srv://kevinfboutilier:<password>@firstcluster.busyfol.mongodb.net/<database>?retryWrites=true&w=majority&appName=firstCluster

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
let mongoDB;
if (process.env.STATUS === "development") {
  console.log(`Using development database`);
  mongoDB = process.env.DEV_URI;
} else if (process.env.STATUS === "production") {
  console.log(`Using production database`);
  mongoDB = process.env.PROD_URI;
} else {
  console.log(error);
  console.log("process.env.STATUS is neither development or production.");
}

// const mongoDB = process.env.MONGODB_URI || dev_db_url;
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}
// **********************************************************************************************************************************************************
// So what they want me to do next is create a new database for production and store it's connection string in the ".env" file accessible on glitch.
// That way, the production code isn't here in this repository, it's safely stored on glitch.
// The code above says: If we have a prduction database, use data from that. Otherwise, here's our unencrypted development connection string.

// **********************************************************************************************************************************************************

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
// OLD Connection string for mongoDB:
// mongodb+srv://kevinfboutilier:AMRPU6oe0Zv8fCKW@locallibrary.o1xynnt.mongodb.net/?retryWrites=true&w=majority&appName=localLibrary
//  ************************************************************************************************************************************************************************
