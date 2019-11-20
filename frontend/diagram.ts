/*
 * frontend/diagram.ts
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

import * as $ from "jquery";

import { ChangeAttendance } from "./attendance-common";
import { getParameter } from "./parameter";
import { ErrorMap, processErrors } from "./error";
import { Nullable } from "./utils";
import { sendPostData } from "./post";

/* Error Numbers
  1 - Incorrectly set events
  2 - Invalid session
  4 - Internal Error
*/

const errMap: ErrorMap = {
  1: "Unable to set another student's events.",
  2: "Your session has expired. Please try logging in again.",
  4: "An internal error occurred, please consult the site administrators."
};

interface StudentForm {
  selectedEvents: Array<HTMLInputElement>;
};

// contains which changes we have to make
let attendanceChanges: Array<ChangeAttendance> = [];

let submitButton: JQuery;

// add triggers to a row of checkboxes
function addTriggerToRow(row: JQuery) {
  let form = row.find("form")[0];
  let checkboxes = row.find(":input");

  let studentId = parseInt(form.id.split("-")[2], 10);
  checkboxes.each(function(this: HTMLElement) {
    const checkbox = <HTMLInputElement>this;
    if (checkbox && !checkbox.disabled) {
      console.log(checkbox.classList[0]);
      let eventId = parseInt(checkbox.classList[0].split("-")[2], 10);

      $(checkbox).click((function(sid: number, eid: number, cbox: HTMLInputElement) {
        return function() {
          // loop through and determine which to edit
          for (let i = 0; i < attendanceChanges.length; i++) {
            if (attendanceChanges[i].studentId === sid && attendanceChanges[i].eventId === eid) {
              attendanceChanges[i].attendance = cbox.checked;
              return;
            }
          }

          attendanceChanges.push({
            studentId: sid,
            eventId: eid,
            attendance: cbox.checked
          });

          submitButton.removeClass("vanished");
        };
      })(studentId, eventId, checkbox));
    }
  });
}

function submitAttendance() {
  const postData = {
    attendance: JSON.stringify(attendanceChanges)
  };
  
  sendPostData("/process-attendance", postData);
}

export function foundDiagram() {
  console.log("Running diagram code"); 

  submitButton = $("#submit");
  
  if (getParameter("errors") === "8") {
    $("#errorMessage").css("color", "green").html("<p>Successfully set attendance!</p>");
  } else {
    processErrors(errMap);
  }

  $("tr").each(function(this: HTMLElement) {
    const row = $(this);
    if (row.find("form").length > 0) {
      addTriggerToRow(row);
    } 
  }); 

  submitButton.click(submitAttendance); 
}
