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


// ************************************************************************************************************************************************************************************************************
const common = require("./node_modules/common")
// app.use(common())
// Trying to 'use' common ^above breaks the app.  At the moment the app is working and deployed. I can't remember where I was seeing the error that said common was missing, but it doesn't seem to be visible now so we'll leave as is. 
// ************************************************************************************************************************************************************************************************************


const dotenv = require("dotenv").config();
// The above line is necessary to read from the .env file

// Finally create the app object
const app = express();


// ************************************************************************************************************************************************************************************************************
// The below is to troubleshoot proxy issues interfering with the rate limiter working correctly. 
// I believe this is the issue resulting in the Content-Security-Policy error in the client side console. 
// We were suggested to attempt the following: 
// https://github.com/express-rate-limit/express-rate-limit/wiki/Troubleshooting-Proxy-Issues

// We still have not fixed this issue. I tried 1-15 and did not return a match to my ip address.
app.set('trust proxy', 1);
// app.get('/ip', (request, response) => response.send(request.ip));
// app.get('/x-forwarded-for', (request, response) => response.send(request.headers['x-forwarded-for']))
// ************************************************************************************************************************************************************************************************************



// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 10 * 1000, // 10 seconds
  max: 10,
});
// Apply rate limiter to all requests
app.use(limiter);

// **********************************************************************************************************************************************************
// Our code below is intentionally slightly different that the example.
// Since our development and production databases are both in the same mongoDB cluster, they both share the same password and we don't want to upload that to git.
// Both URI's are stored in environment variables and the appropriate one is used based on what mode is set.
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
let mongoDB;
if (process.env.STATUS === "development") {
  console.log(`Using development database`);
  console.log(`port = ${process.env.DEV_PORT}`);
  mongoDB = process.env.DEV_URI;
} else if (process.env.STATUS === "production") {
  console.log(`Using production database`);
  console.log(`port = ${process.env.PROD_PORT}`);
  mongoDB = process.env.PROD_URI;
} else {
  console.log(error);
  console.log("process.env.STATUS is neither development or production.");
}
// **********************************************************************************************************************************************************


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


// **********************************************************************************************************************************************************
// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);
// We're getting an error related to helmet's contentSecurityPolicy (csp). Below is my attempt to turn that feature off, it didn't work. Still got the same error.

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

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
//       "script-src-elem": "false",
//     },
//   })
// );

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       "script-src": ["code.jquery.com", "cdn.jsdelivr.net"],
//     },
//   })
// );
// **********************************************************************************************************************************************************

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

