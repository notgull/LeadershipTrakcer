// BSD LICENSE - c John Nunley and Larson Rivera

import { ChangeAttendance } from "./attendance-common";
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

const submitButton = document.getElementById("submit");

// add triggers to a row of checkboxes
function addTriggerToRow(row: HTMLElement) {
  let form = row.getElementsByTagName("form")[0];
  let checkboxes = form.getElementsByTagName("input"); 

  let studentId = parseInt(form.id.split("-")[2], 10);
  for (const checkbox of Array.from(checkboxes)) {
    let eventId = parseInt(checkbox.classList[0].split("-")[2], 10);

    if (checkbox.classList.contains("disabled")) {
      checkbox.onclick = function(): boolean { return false; };
    } else {
      checkbox.onchange = (function(sid: number, eid: number, cbox: HTMLInputElement) {
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

          submitButton.classList.remove("vanished");
        };
      })(studentId, eventId, checkbox);
    }
  }
}

function submitAttendance() {
  const postData = {
    attendance: attendanceChanges
  };
  
  sendPostData("/process-attendance", postData);
}

export function foundDiagram() {
  for (const row of Array.from(document.getElementsByTagName("tr"))) {
    if (row.getElementsByTagName("form").length !== 0) {
      addTriggerToRow(row);
    }
  }

  if (submitButton) {
    submitButton.onclick = submitAttendance;
  }
}
