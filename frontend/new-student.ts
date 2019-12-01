/*
 * frontend/new-student.ts
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
import { Belt, parseBelt } from "./belt";
import { ErrorMap, processErrors } from "./error";
import { getCookie } from "./cookie";
import { getParameter } from "./parameter";
import { parse } from "querystring";
import { sendPostData } from "./post";

import * as $ from "jquery";

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
  else if (!parseBelt(<string>beltrank)) error |= 2;
  
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

  if (beltInput.length && teller.length) {
    const tellBeltRank = function() {
      const rank = parseBelt(<string>beltInput.val());
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
  console.log(getCookie("sessionId"));
  console.log($("#loginlink").length);
  if (getCookie("sessionId").length === 0 || ($("#loginlink").length)) {
    $("#createstudent").html("You must be logged in in order to create a new student");
    return;
  }

  processErrors(errMap);

  $("#submit").click(processNewStudent);

  addBeltrankTeller();
}
