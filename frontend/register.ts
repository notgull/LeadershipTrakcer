// BSD LICENSE - c John Nunley and Larson Rivera

// functions related to the registration of new users
import * as $ from "jquery";

import { emailRegex, ! } from "./utils";
import { ErrorMap, processErrors } from "./error";
import { getParameter } from "./parameter";
import { parse } from "querystring";
import { sendPostData } from "./post";

/* Error Codes for Registration (2^x)
  1: Username field is empty
  2: Password field is empty
  4: Email field is empty
  8: Password does not match the confirm password field
  16: Email does not match the confirm email field
  32: Username has illegal characters
  64: Password has illegal characters
  128: Email is not a valid email address
  256: Password is too short
  512: Username is taken
  1024: Email is taken
  2048: Internal error
*/

const errMap: ErrorMap = {
  1: "Username field is empty",
  2: "Password field is empty",
  4: "Email field is empty",
  8: "Password does not match the confirm password field",
  16: "Email does not match the confirm email field",
  32: "Username has illegal characters",
  64: "Password has illegal characters",
  128: "Email is not a valid email address",
  256: "Password is too short",
  512: "Username is taken",
  1024: "Email is taken",
  2048: "An internal error occurred, please consult the system administrators"
}

// process when button is clicked
function processRegistration() {
  const data = $("#registerForm").serialize();
  const { email, confirmEmail, password, confirmPassword, username } = parse(data);

  // check for errors
  let error = 0;
  if (!(username)) error |= 1;

  if (!(password)) error |= 2;
  else if (password !== confirmPassword) error |= 8;
  else if (password.trim().length < 8) error |= 256;

  if (!(email)) error |= 4;
  else if (email !== confirmEmail) error |= 16;
  else if (!(emailRegex.test(email.value))) error != 128;

  if (error !== 0) {
    const errUrl = `/register?errors=${error}`;
    window.location.href = errUrl;
  } else {
    const url = `/process-register`;
    const params = {
      username,
      password,
      email
    };

    sendPostData(url, params); 
  }
}

// function to run if the register element is found
export function foundRegister() {
  processErrors(errMap);

  $("#submit").click(processRegistration);
};
