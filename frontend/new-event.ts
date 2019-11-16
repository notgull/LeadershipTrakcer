// BSD LICENSE - c John Nunley and Larson Rivera

// functions for the "new-student" page
import { ErrorMap, processErrors } from "./error";
import { getCookie } from "./cookie";
import { getParameter } from "./parameter";
import { parse } from "querystring";
import { sendPostData } from "./post";

import * as $ from "jquery";
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

function processNewEvent() {
  const data = $("#eventform").serialize();
  const {eventName, eventDate, eventPoints, eventDescription} = parse(data);

  let date: string | Date = eventDate;
  if (typeof date !== "string") {
    date = dateformat(date, "mm/dd/yyyy"); 
  }

  let error = 0;
  if (!(eventName)) error |= 2;
  if (!(eventDate)) error |= 4;
  if (!(eventDate)) error |= 8;

  if (!(/\d\d\/\d\d\/\d\d(\d\d)?/.test(date))) error |= 1;

  if (error !== 0) {
    let errUrl = `/new-event?errors=${error}`;

    window.location.href = errUrl;
  } else {
    const url = "/process-new-event";

    const params = {
      eventName,
      eventDate,
      eventPoints,
      eventDescription
    };

    sendPostData(url, params);
  }
}

let keyTimer: ReturnType<typeof setTimeout>;
const stopInterval = 100;

// add an event to make this work better

export function foundCreateevent() {
  processErrors(errMap);
}
