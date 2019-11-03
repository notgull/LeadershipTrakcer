// BSD LICENSE - c John Nunley and Larson Rivera

// functions for the "new-student" page
import { getCookie } from "./cookie";
import { getParameter } from "./parameter";
import { isFieldEmpty } from "./utils";
import { sendPostData } from "./post";

/* New Student Errors (2^x)
 1 - Event wih Current Details exists
 2 - Name field is empty
 4 - Date field empty
 8 - Points field empty
 16 - Description field empty
 32 - Invalid session
 64 - Internal error
*/

function addError(err: string) {
  const errList = document.getElementById("errorMessage");
  errList.innerHTML += `<li>${err}</li>`;
}

function processError() {
  const errorParameter = getParameter("errors");
  if (errorParameter) {
    const errList = document.getElementById("errorMessage");
    errList.innerHTML = "<p>Unfortunately, we were unable to process this new student for the following reasons:</p><ul>";

    const error = parseInt(errorParameter, 10);
    if (error & 1) addError("An Event with this name and date already exists.");
    if (error & 2) addError("Name field is empty");
    if (error & 4) addError("Date field is empty");
    if (error & 8) addError("Points field is empty");
    if (error & 16) addError("Please add an event description");
    if (error & 32) addError("Invalid session ID. Please try logging out and logging back in.");
    if (error & 64) addError("An internal error occurred. Please contact the system administrators.");

    errList.innerHTML += "</ul><p>Please take care of these problems before submitting again.</p>";
  }
}

interface NewEventForm {
  eventName: HTMLInputElement;
  eventDate: HTMLInputElement;
  eventPoints: HTMLInputElement;
  eventDescription: HTMLInputElement;
};

function processNewEvent() {
  const data: NewEventForm = (<any>document.getElementById("eventform"));
  const {eventName, eventDate, eventPoints, eventDescription} = data;

  let error = 0;
  if (isFieldEmpty(eventName)) error |= 2;
  if (isFieldEmpty(eventDate)) error |= 4;
  if (isFieldEmpty(eventDate)) error |= 8;

  if (error !== 0) {
    let errUrl = `/new-event?errors=${error}`;

    window.location.href = errUrl;
  } else {
    const url = "/process-new-event";
    const params = {
      eventName: eventName.value,
      eventDate: eventDate.value,
      eventPoints: eventPoints.value,
      eventDescription: eventDescription.value

    };

    sendPostData(url, params);
  }
}

let keyTimer: ReturnType<typeof setTimeout>;
const stopInterval = 100;

//add an event to make
/*
function addBeltrankTeller() {
  const beltInput = <HTMLInputElement>document.getElementById("beltrank");
  const teller = document.getElementById("beltrankteller");

  if (beltInput && teller) {
    const tellBeltRank = function() {
      const rank = parseBelt(beltInput.value);
      if (rank) {
        teller.innerHTML = `You have input belt rank "${rank}"`;
      } else {
        teller.innerHTML = "Unable to determine what belt your student is at";
      }
    }

    beltInput.onkeyup = function () {
      //console.log("Key up");
      clearTimeout(keyTimer);
      keyTimer = setTimeout(tellBeltRank, stopInterval);
    };

    beltInput.onkeydown = function () {
      clearTimeout(keyTimer);
    };
  }
}

// function to run if createstudent element is found
export function foundCreatestudent() {
  if (getCookie("sessionId").length === 0 || document.getElementById("loginlink")) {
    document.getElementById("createstudent").innerHTML = "You must be logged in in order to create a new student";
  }

  processError();
  const submitButton = document.getElementById("submit");
  if (submitButton) submitButton.onclick = processNewStudent;
  addBeltrankTeller();
}
*/

export function foundCreateevent() {

}
