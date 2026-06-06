const express = require("express");
const route = express.Router();
const Entry = require("../model/entry");

// Home page - render index (you can customize as needed)
route.get("/", async (req, res) => {
  try {
    const entries = await Entry.find().lean();
    res.render("index", { entries });
  } catch (err) {
    console.error('Error fetching entries for index', err);
    res.status(500).send('Server error');
  }
});

// Watchlist page - render entries that are not viewed
route.get("/watchlist", async (req, res) => {
  try {
    const entries = await Entry.find({ viewed: { $ne: true } }).lean();
    res.render("watchlist", { entries });
  } catch (err) {
    console.error('Error fetching watchlist', err);
    res.status(500).send('Server error');
  }
});

// Create a new entry. Accept multiple possible client field names and
// map them to the schema fields (watchlist, content, email, date)
route.post("/createEntry", async (req, res) => {
  try {
    const watchlistName = req.body.watchlist || req.body.title || req.body.dramaName || "";
    const content = req.body.content || req.body.comments || "";
    const dateVal = req.body.date || new Date().toISOString().split("T")[0];

    const entry = new Entry({
      date: new Date(dateVal + "T00:00:00"),
      email: req.body.email || "anonymous@example.com",
      watchlist: watchlistName,
      content,
    });

    await entry.save();
    res.status(201).json({ id: entry._id });
  } catch (err) {
    console.error('Error creating entry', err);
    res.status(500).send('Server error');
  }
});

// Update an existing entry by id (used by edit modal). Accepts same
// field shapes as create and only sets fields present in the request.
route.put('/entry/:id', async (req, res) => {
  const update = {};
  if (req.body.watchlist || req.body.title || req.body.dramaName) {
    update.watchlist = req.body.watchlist || req.body.title || req.body.dramaName;
  }
  if (req.body.content || req.body.comments) update.content = req.body.content || req.body.comments;
  if (typeof req.body.viewed !== 'undefined') update.viewed = req.body.viewed;
  if (req.body.date) update.date = new Date(req.body.date + 'T00:00:00');

  try {
    const updated = await Entry.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.sendStatus(404);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error updating entry', err);
    res.sendStatus(500);
  }
});

// Already-watched page - render entries marked viewed
route.get('/alreadyWatchlist', async (req, res) => {
  try {
    const entries = await Entry.find({ viewed: true }).lean();
    res.render('alreadyWatchlist', { entries });
  } catch (err) {
    console.error('Error fetching alreadyWatchlist', err);
    res.status(500).send('Server error');
  }
});

module.exports = route;