// BSD LICENSE - c John Nunley and Larson Rivera

// functions for the "new-student" page
import { ErrorMap, processErrors } from "./error";
import { getCookie } from "./cookie";
import { getParameter } from "./parameter";
import { isFieldEmpty } from "./utils";
import { sendPostData } from "./post";

import * as dateformat from "dateformat";

/* New Event Errors (2^x)
 1 - Event wih Current Details exists
 2 - Name field is empty
 4 - Date field empty
 8 - Points field empty
 16 - Description field empty
 32 - Invalid date
 64 - Invalid session
 128 - Internal error
*/

const errMap: ErrorMap = {
  1: "Event with name and date already exists",
  2: "Name field is empty",
  4: "Date field is empty",
  8: "Points field is empty",
  16: "Description field is empty",
  32: "Invalid date",
  64: "Invalid session ID. Please try logging out and logging back in.",
  128: "An internal error occurred. Please contact the system administrators."
};

interface NewEventForm {
  eventName: HTMLInputElement;
  eventDate: HTMLInputElement;
  eventPoints: HTMLInputElement;
  eventDescription: HTMLInputElement;
};

function processNewEvent() {
  const data: NewEventForm = (<any>document.getElementById("eventform"));
  const {eventName, eventDate, eventPoints, eventDescription} = data;

  let date = eventDate.value;
  if (date instanceof Date) {
    date = dateformat(date, "mm/dd/yyyy"); 
  }

  let error = 0;
  if (isFieldEmpty(eventName)) error |= 2;
  if (isFieldEmpty(eventDate)) error |= 4;
  if (isFieldEmpty(eventDate)) error |= 8;

  if (!(/\d\d\/\d\d\/\d\d(\d\d)?/.match(date))) error |= 1;

  if (error !== 0) {
    let errUrl = `/new-event?errors=${error}`;

    window.location.href = errUrl;
  } else {
    const url = "/process-new-event";

    const params = {
      eventName: eventName.value,
      eventDate: date,
      eventPoints: eventPoints.value,
      eventDescription: eventDescription.value
    };

    sendPostData(url, params);
  }
}

let keyTimer: ReturnType<typeof setTimeout>;
const stopInterval = 100;

//add an event to make

export function foundCreateevent() {
  processErrors(errMap);
}
