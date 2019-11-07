// BSD LICENSE - c John Nunley and Larson Rivera

// functions for the "new-student" page
import { Belt, parseBelt } from "./belt";
import { ErrorMap, processErrors } from "./error";
import { getCookie } from "./cookie";
import { getParameter } from "./parameter";
import { isFieldEmpty } from "./utils";
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

interface NewStudentForm {
  firstname: HTMLInputElement;
  lastname: HTMLInputElement;
  beltrank: HTMLInputElement;
};

function processNewStudent() {
  const data: NewStudentForm = (<any>document.getElementById("studentform"));
  const { firstname, lastname, beltrank } = data;

  let error = 0;
  if (isFieldEmpty(firstname)) error |= 4;
  if (isFieldEmpty(lastname)) error |= 8;

  if (isFieldEmpty(beltrank)) error |= 16;
  else if (!parseBelt(beltrank.value)) error |= 2;
  
  if (error !== 0) {
    let errUrl = `/new-student?errors=${error}`;
    if (error & 2) {
      errUrl += `&belt=${beltrank.value}`;
    }

    window.location.href = errUrl;
  } else {
    const url = "/process-new-student";
    const params = {
      first: firstname.value,
      last: lastname.value,
      belt: beltrank.value
    };

    sendPostData(url, params);
  }
}

let keyTimer: ReturnType<typeof setTimeout>;
const stopInterval = 100;

// add an event to make
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
    return;
  }

  processError(errMap);
  const submitButton = document.getElementById("submit");
  if (submitButton) submitButton.onclick = processNewStudent;
  addBeltrankTeller();
}
