// BSD LICENSE - c John Nunley and Larson Rivera

import { ErrorMap, processErrors } from "./error";
import { getParameter } from "./parameter";
import { sendPostData } from "./post";

/* Error Numbers
 1 - Username/password incorrect
 2 - Internal error
*/

const errMap: ErrorMap = {
  1: "Username and password combination were not found in database.",
  2: "An internal error occurred, please consult the site administrators."
};

interface LoginForm {
  username: HTMLInputElement;
  password: HTMLInputElement;
}

// submit login details
function processLogin() {
  const data: LoginForm = (<any>document.getElementById("loginForm"));
  const { username, password } = data;

  const url = "/process-login";
  const params = {
    username: username.value,
    password: password.value
  };

  sendPostData(url, params);
}

// run on login element found
export function foundLogin() {
  processErrors(errMap);
  
  const submitButton = document.getElementById("submit");
  if (submitButton)
    submitButton.onclick = processLogin;
}
