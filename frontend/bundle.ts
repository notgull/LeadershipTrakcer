// BSD LICENSE - c John Nunley and Larson Rivera

// essentially the "main" function of the frontend

import { foundCreatestudent } from "./new-student";
import { foundLogin } from "./login";
import { foundRegister } from "./register";

console.log("Executing client side scripts...");

window.onload = function() {
  console.log("Executing onload");

  // if the register element is found, add triggers to it
  if (document.getElementById("register")) {
    foundRegister();
  }

  // if the login element is found, add triggers to it
  if (document.getElementById("login")) {
    foundLogin();
  }

  // if the createstudent element is found, add triggers to it
  if (document.getElementById("createstudent")) {
    foundCreatestudent();
  }
};
