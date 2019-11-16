// BSD LICENSE - c John Nunley and Larson Rivera

// functions for the "new-student" page
import { Belt, parseBelt } from "./belt";
import { ErrorMap, processErrors } from "./error";
import { getCookie } from "./cookie";
import { getParameter } from "./parameter";
import { parse } from "querystring";
import { sendPostData } from "./post";

/* New Student Errors (2^x)
 1 - Name combination already exists
 2 - Improper belt value
 4 - First name empty
 8 - Last name empty
 16 - Belt rank empty
 32 - Invalid session
 64 - Internal error
*/

function getBeltParameter(): string {
  const beltParameter = getParameter("belt");
  if (beltParameter) return `"${beltParameter}"`;
  else return "Belt value";
}

const errMap: ErrorMap = {
  1: "First and last name combination already exist in database",
  2: (): string => { return `${getBeltParameter()} is not a valid belt rank`; },
  4: "First name field is empty",
  8: "Last name field is empty",
  16: "Belt rank field is empty",
  32: "Invalid session ID. Please try logging out and logging back in.",
  64: "An internal error occurred. Please contact the system administrators."
};

function processNewStudent() {
  const data = $("#studentform").serialize();
  const { firstname, lastname, beltrank } = parse(data);

  let error = 0;
  if (!(firstname)) error |= 4;
  if (!(lastname)) error |= 8;

  if (!(beltrank)) error |= 16;
  else if (!parseBelt(beltrank)) error |= 2;
  
  if (error !== 0) {
    let errUrl = `/new-student?errors=${error}`;
    if (error & 2) {
      errUrl += `&belt=${beltrank}`;
    }

    window.location.href = errUrl;
  } else {
    const url = "/process-new-student";
    const params = {
      first: firstname,
      last: lastname,
      belt: beltrank
    };

    sendPostData(url, params);
  }
}

let keyTimer: ReturnType<typeof setTimeout>;
const stopInterval = 100;

// add an event to make
function addBeltrankTeller() {
  const beltInput = $("#beltrank");
  const teller = $("#beltrankteller");

  if (beltInput.length() && teller.length()) {
    const tellBeltRank = function() {
      const rank = parseBelt(beltInput.val());
      if (rank) {
        teller.html(`You have input belt rank "${rank}"`);
      } else {
        teller.html("Unable to determine what belt your student is at");
      }
    }

    beltInput.keyup(() => {
      //console.log("Key up");
      clearTimeout(keyTimer);
      keyTimer = setTimeout(tellBeltRank, stopInterval);
    });

    beltInput.keydown(() => {
      clearTimeout(keyTimer);
    });
  }
}

// function to run if createstudent element is found
export function foundCreatestudent() {
  if (getCookie("sessionId").length === 0 || !($("#loginlink").length())) {
    $("#createstudent").html("You must be logged in in order to create a new student");
    return;
  }

  processErrors(errMap);

  $("#submit").click(processNewStudent);

  addBeltrankTeller();
}
