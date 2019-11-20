/*
 * frontend/register.ts
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

// functions related to the registration of new users
import * as $ from "jquery";

import { emailRegex } from "./utils";
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
  else if ((<string>password).trim().length < 8) error |= 256;

  if (!(email)) error |= 4;
  else if (email !== confirmEmail) error |= 16;
  else if (!(emailRegex.test(<string>email))) error != 128;

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
