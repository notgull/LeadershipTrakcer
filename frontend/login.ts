// BSD LICENSE - c John Nunley and Larson Rivera
import * as $ from "jquery";

import { ErrorMap, processErrors } from "./error";
import { getParameter } from "./parameter";
import { parse } from "querystring";
import { sendPostData } from "./post";

/* Error Numbers
 1 - Username/password incorrect
 2 - Internal error
*/

const errMap: ErrorMap = {
  1: "Username and password combination were not found in database.",
  2: "An internal error occurred, please consult the site administrators."
};

// submit login details
function processLogin() {
  // serialize the form then send the data
  const data = $("#loginForm").serialize();
  const { username, password } = parse(data);

  const url = "/process-login";
  const params = {
    username,
    password
  };

  sendPostData(url, params);
}

// run on login element found
export function foundLogin() {
  processErrors(errMap);
  
  $("#submit").click(processLogin);
}
