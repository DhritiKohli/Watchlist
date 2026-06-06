const express = require("express");
const route = express.Router();
const Entry = require("../model/entry");
//FIXME: need to completely modify this code to fit the watchlist code instead of the watchlist code, but this is a good starting point for the CRUD operations

// easy way to assign static data to a variable

// pass a path (e.g., "/") and a callback function to the get method
//  when the client makes an HTTP GET request to the specified path,
//  the callback function is executed
// so if you type http://localhost:8080/ then the following code will run
route.get("/", async (req, res) => {
  // the req parameter references the HTTP request object, which has
  //  a number of properties
  console.log("path: ", req.path); // will be shown on the server not on chrome

  //  convert MongoDB objects to objects formatted for the EJS template
  const formattedEntries = entries.map((entry) => {
    return {
      id: entry._id,
      date: entry.date.toLocaleDateString(),
      title: entry.title,
      content: entry.content.slice(0, 20) + "...",
    };
  });

  // the res parameter references the HTTP response object
  res.render("index", { entries: formattedEntries }); // will be shown on the client side (chrome or your web-browser)
});

route.get("/watchlist", (req, res) => {
  res.render("watchlist");
});

route.post("/createEntry", async (req, res) => {
  const entry = new Entry({
    // When the time zone offset is absent, date-only forms are interpreted as
    //  a UTC time and date-time forms are interpreted as a local time. We want
    //  the date object to reflect local time; so, add a time of midnight.
    date: new Date(req.body.date + "T00:00:00"),
    title: req.body.title,
    content: req.body.content,
  });
  await entry.save();

  res.status(201).end();
});

//need to add routes for when another drama is checked off the watchlist, it is deleted from the watchlist, and added to the already watched list, and when a drama is added to the watchlist. 
//maybe in the future add a note/ drama review section for each drama in the already watched list, but that is not a priority right now


module.exports = route;