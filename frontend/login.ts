// BSD LICENSE - c John Nunley and Larson Rivera

import { getParameter } from "./parameter";
import { sendPostData } from "./post";

/* Error Numbers
 1 - Username/password incorrect
 2 - Internal error
*/

// process the "error" URL parameter
function processErrors() {
  const errorParam = getParameter("error");
  if (errorParam) {
    const error = parseInt(errorParam, 10);
    let errorMessage = "";
    if (error === 1) {
      errorMessage = "Username and password combination were not found in database";
    } else {
      errorMessage = "An internal error occurred. Please contact a site administrator.";
    }

    document.getElementById("errorMessage").innerHTML = errorMessage;
  }
}

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
  processErrors();
  
  const submitButton = document.getElementById("submit");
  if (submitButton)
    submitButton.onclick = processLogin;
}
