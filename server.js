/**
 * main Javascript file for the application
 *  this file is executed by the Node server
 */

// import the http module, which provides an HTTP server
const http = require("http");

// import the express module, which exports the express function
const express = require("express");
const path = require("path");

// invoke the express function to create an express application
const app = express();

// add middleware to the
app.use(express.json());

// load environment variables from the .env file into process.env
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

// connect to database
const connectDB = require("./server/database/connection");
connectDB();
// set the template enginge to EJS, which generates HTML with embedded
//  JavaScript
app.set("view engine", "ejs");

// load assets
const assetsDir = path.join(__dirname, "assets");
app.use("/assets", express.static(assetsDir));
app.use("/css", express.static(path.join(assetsDir, "css"))); // middleware and referring to the client's perspective
app.use("/img", express.static(path.join(assetsDir, "img")));
app.use("/js", express.static(path.join(assetsDir, "js")));

// create the HTTP server
const server = http.createServer(app);

// to keep this file manageable, we will move the routes to a separate file
//    the exported router object is an example of middleware
app.use("/", require("./server/routes/router"));
// app.use("/admin", require("./server/routes/router"));

// start the server at port 8080
server.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});