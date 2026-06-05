/**
 *  contains client side javascript functions
 *  (primarily event handlers to fetch data from Node server)
 */

const submitButton = document.querySelector("input.submit");
submitButton.addEventListener("click", async () => {
  const date = document.querySelector("input.date").value;
  // a more sophisticated select that selects all input elements of
  //  a class competency that are checked
  const ecButtons = document.querySelectorAll("input.competency:checked");
  // if the length of the ecButtons array is greater than 0, then assign the [0] index value to
  //    const employabilityCompetency
  const employabilityCompetency =
    ecButtons.length > 0 ? ecButtons[0].value : null;
  const content = document.querySelector("textarea.content").value;
  // set a break-point here
  const entry = { date, competency: employabilityCompetency, content }; // if the name of the property is the same as the name of the variable, you don't need to do {date : date}
  //                property short-hand
  const response = await fetch("/createEntry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  });
  if (response.ok) {
    window.location = "/";
  } else {
    console.error("error creating entry");
  }
});