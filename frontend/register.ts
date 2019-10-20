// BSD LICENSE - c John Nunley and Larson Rivera

// functions related to the registration of new users

import { getParameter } from "./parameter";
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

function addError(error: string) {
  const errorList = document.getElementById("errorMessage");
  if (errorList)
    errorList.innerHTML += `<li>${error}</li>`;
}

function processErrors() {
  const errorParam = getParameter("errors");
  if (errorParam) {
    const error = parseInt(errorParam, 10);
    const errorList = document.getElementById("errorMessage");
    errorList.innerHTML = "<p>Unfortunately, we were unable to process your registration for the following reasons:</p><ul>";

    if (error & 1) addError("Username field is empty");
    if (error & 2) addError("Password field is empty");
    if (error & 4) addError("Email field is empty");
    if (error & 8) addError("Password does not match the confirm password field");
    if (error & 16) addError("Email does not match the confirm email field");
    if (error & 32) addError("Username has illegal characters");
    if (error & 64) addError("Password has illegal characters");
    if (error & 128) addError("Email is not a valid email address");
    if (error & 256) addError("Password is too short");
    if (error & 512) addError("Username is taken");
    if (error & 1024) addError("Email is taken");
    if (error & 2048) addError("An internal error occurred, please consult the system administrators");

    errorList.innerHTML += "</ul><p>Please take care of these problems before submitting again.</p>";
  }
}

function isFieldEmpty(field: HTMLInputElement): boolean {
  return !(field.value.trim().length > 0);
}

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

interface RegistrationForm {
  email: HTMLInputElement;
  confirmEmail: HTMLInputElement;
  password: HTMLInputElement;
  confirmPassword: HTMLInputElement;
  username: HTMLInputElement;
};

// process when button is clicked
function processRegistration() {
  const data: RegistrationForm = (<any>document.getElementById("registerForm"));
  /*const email: HTMLInputElement = data.email;
  const confirmEmail: HTMLInputElement = data.confirmEmail;
  const password: HTMLInputElement = data.password;
  const confirmPassword: HTMLInputElement = data.confirmPassword;
  const username: HTMLInputElement = data.username;*/
  const { email, confirmEmail, password, confirmPassword, username } = data;
  
  // check for errors
  let error = 0;
  if (isFieldEmpty(username)) error |= 1;

  if (isFieldEmpty(password)) error |= 2;
  else if (password.value !== confirmPassword.value) error |= 8;
  else if (password.value.trim().length < 8) error |= 256;

  if (isFieldEmpty(email)) error |= 4;
  else if (email.value !== confirmEmail.value) error |= 16; 
  else if (emailRegex.test(email.value)) error != 128;

  if (error !== 0) {
    const errUrl = `/register?errors=${error}`;
    window.location.href = errUrl;
  } else {
    const url = `/process-register`;
    const params = { 
      username: username.value,
      password: password.value,
      email: email.value
    };
    
    sendPostData(url, params); 
  }
}

// function to run if the register element is found
export function foundRegister() {
  processErrors(); 
  let submitButton = document.getElementById("submit");
  if (submitButton) {
    submitButton.onclick = processRegistration;
  }
};
