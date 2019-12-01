/*
 * frontend/new-event.ts
 * LeadershipTrakcer - Martial arts attendance logger
 *
 * Copyright (c) 2019, John Nunley and Larson Rivera
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// functions for the "new-student" page
import { ErrorMap, processErrors } from "./error";
import { getCookie } from "./cookie";
import { getParameter } from "./parameter";
import { parse } from "querystring";
import { sendPostData } from "./post";

import * as $ from "jquery";

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

  let date: Date = new Date(<string>eventDate);

  let error = 0;
  if (!(eventName)) error |= 2;
  if (!(eventDate)) error |= 4;
  if (!(eventPoints)) error |= 8;

  //if (!(/\d\d\/\d\d\/\d\d(\d\d)?/.test(date))) error |= 1;

  if (error !== 0) {
    let errUrl = `/new-event?errors=${error}`;

    window.location.href = errUrl;
  } else {
    const url = "/process-new-event";

    const params = {
      eventName,
      date,
      eventPoints,
      eventDescription
    };

    sendPostData(url, params);
  }
}

let keyTimer: ReturnType<typeof setTimeout>;
const stopInterval = 100;

// add an event to make this work better

export function foundCreateEvent() {
  if (getCookie("sessionId").length === 0 || !($("#loginlink").length)) {
    $("#createEvent").html("You must be logged in in order to create a new event");
    return;
  }

  processErrors(errMap);

  $("#submit").click(processNewEvent);
}
