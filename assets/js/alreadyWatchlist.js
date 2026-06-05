/**
 *  contains client side javascript functions
 *  (primarily event handlers to fetch data from Node server)
 */

// Get the submit button from the page
const submitButton = document.querySelector("input.submit");
const deleteButton = document.querySelector("input.delete");

// When submit button is clicked, run this code
submitButton.addEventListener("click", async () => {
  // Get the entry ID from the hidden input field
  const journalId = document.querySelector("input.journalId").value;

  // Get the date value from the date input
  const date = document.querySelector("input.date").value;

  // Get all checked radio buttons for competency
  const ecButtons = document.querySelectorAll("input.competency:checked");

  // Get the first checked competency value, or null if none selected
  const employabilityCompetency =
    ecButtons.length > 0 ? ecButtons[0].value : null;

  // Get the content from the textarea
  const content = document.querySelector("textarea.content").value;

  // Create an object with all the form data
  const entry = { date, competency: employabilityCompetency, content };

  // Send the data to the server to update the entry
  const response = await fetch("/editEntry/" + journalId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  });

  if (response.ok) {
    window.location = "/";
  } else {
    console.error("error updating entry");
  }
});

deleteButton.addEventListener("click", async () => {
  const journalId = document.querySelector("input.journalId").value;

  // Get the date value from the date input
  const date = document.querySelector("input.date").value;

  // Get all checked radio buttons for competency
  const ecButtons = document.querySelectorAll("input.competency:checked");

  // Get the first checked competency value, or null if none selected
  const employabilityCompetency =
    ecButtons.length > 0 ? ecButtons[0].value : null;

  // Get the content from the textarea
  const content = document.querySelector("textarea.content").value;

  // Create an object with all the form data
  const entry = { date, competency: employabilityCompetency, content };

  // Sending data to the server to delete the entry
  const response = await fetch("/editEntry/" + journalId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  });

  if (response.ok) {
    window.location = "/";
  } else {
    console.error("error deleting entry");
  }
});