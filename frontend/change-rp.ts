// BSD LICENSE - c John Nunley and Larson Rivera

import { ErrorMap, processErrors } from "./error";
import { getParameter } from "./parameter";
import { sendPostData } from "./post";

/* Error Codes (2^x)
  1 - Student not found
  2 - Invalid rating points
  4 - Internal error
  8 - Success
*/

const errMap: ErrorMap = {
  1: "Student was not found",
  2: "An invalid number of leadership points were entered",
  4: "An internal error occurred, please consult the site administrators."
};

// submit rp details
function processChangeRp() {
  const rp = $("rp");
  
  const url = "/process-change-rp";
  const params = {
    studentId: parseInt(getParameter("studentId"), 10),
    rp: rp.val()
  };

  sendPostData(url, params);
}

export function foundChangeRp() {
  if (getParameter("errors") !== "8") {
    processErrors(errMap);
  } else {
    $("#errorMessage").html('Success! <a href="/manage-students">Return to student management portal</a>.');
  }

  $("#submit").click(processChangeRp);
}
