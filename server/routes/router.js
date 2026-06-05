const express = require("express");
const route = express.Router();
const Entry = require("../model/entry");
//FIXME: need to completely modify this code to fit the watchlist code instead of the journal code, but this is a good starting point for the CRUD operations

// easy way to assign static data to a variable
const competencies = require("../model/competencies.json");

// pass a path (e.g., "/") and a callback function to the get method
//  when the client makes an HTTP GET request to the specified path,
//  the callback function is executed
// so if you type http://localhost:8080/ then the following code will run
route.get("/", async (req, res) => {
  // the req parameter references the HTTP request object, which has
  //  a number of properties
  console.log("path: ", req.path); // will be shown on the server not on chrome

  const entries = await Entry.find().sort({ date: -1 }); // ask Schmit how this works

  //  convert MongoDB objects to objects formatted for the EJS template
  const formattedEntries = entries.map((entry) => {
    return {
      id: entry._id,
      date: entry.date.toLocaleDateString(),
      competency: entry.competency,
      content: entry.content.slice(0, 20) + "...",
    };
  });

  // the res parameter references the HTTP response object
  res.render("index", { entries: formattedEntries }); // will be shown on the client side (chrome or your web-browser)
});

// route.get("/admin", (req, res) => {
//   // the req parameter references the HTTP request object, which has
//   //  a number of properties
//   console.log("path: ", req.path); // will be shown on the server not on chrome

//   // the res parameter references the HTTP response object
//   res.send("Hello World from the Admin! Hehehehehehe"); // will be shown on the client side (chrome or your web-browser)
// });

route.get("/createEntry", (req, res) => {
  res.render("createEntry", { comps: competencies });
});

route.post("/createEntry", async (req, res) => {
  const entry = new Entry({
    // When the time zone offset is absent, date-only forms are interpreted as
    //  a UTC time and date-time forms are interpreted as a local time. We want
    //  the date object to reflect local time; so, add a time of midnight.
    date: new Date(req.body.date + "T00:00:00"),
    email: "dkohli1@stu.naperville203.org",
    competency: req.body.competency,
    content: req.body.content,
  });
  await entry.save();

  res.status(201).end();
});

route.get("/editEntry/:id", async (req, res) => {
  const entry = await Entry.findById(req.params.id);
  // console.log(entry);
  // res.send(entry);
  res.render("editEntry", { journal: entry, comps: competencies });
});

route.put("/editEntry/:id", async (req, res) => {
  await Entry.findByIdAndUpdate(req.params.id, {
    date: new Date(req.body.date + "T00:00:00"),
    email: "dkohli1@stu.naperville203.org",
    competency: req.body.competency,
    content: req.body.content,
  });
  res.status(200).end();
});

route.delete("/editEntry/:id", async (req, res) => {
  await Entry.findByIdAndDelete(req.params.id);
  res.status(200).end();
});

module.exports = route;