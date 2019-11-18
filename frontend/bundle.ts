// BSD LICENSE - c John Nunley and Larson Rivera

// essentially the "main" function of the frontend
import * as $ from "jquery";

import { foundChangeRp } from "./change-rp";
import { foundCreateevent } from "./new-event";
import { foundCreatestudent } from "./new-student";
import { foundDiagram } from "./diagram";
import { foundLogin } from "./login";
import { foundRegister } from "./register";

console.log("Executing client side scripts...");

$(document).ready(() => {
  console.log("Executing onload");

  // if the register element is found, add triggers to it
  if ($("#register").length) {
    foundRegister();
  }

  // if the login element is found, add triggers to it
  if ($("#login").length) {
    foundLogin();
  }

  // if the createstudent element is found, add triggers to it
  if ($("#createstudent").length) {
    foundCreatestudent();
  }
  
  if ($("#createEvent").length) {
    foundCreateevent();
  }

  if ($("#change-rp").length) {
    foundChangeRp();
  }

  if ($("#diagram-table").length) {
    foundDiagram();
  }
});
