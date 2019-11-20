/*
 * frontend/error.ts
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

import * as $ from "jquery";

import { getParameter } from "./parameter";

// handle errors in a default way
type StringResult = () => string;
export type ErrorMap = { [key: number]: string | StringResult };

// process errors from parameter
export function processErrors(errorMap: ErrorMap) {
  const errorParam = getParameter("errors");
  if (errorParam) {
    const error = parseInt(errorParam, 10);
    let errorList = $("#errorMessage");
    if (!errorList.length) {
      errorList = $("<div></div>");
      errorList.attr("id", "errorMessage");
      errorList.append($(document.body))
    }

    let errParts = ["<p>Unfortunately, we were unable to process your request for the following reasons:</p><ul>"];

    let keys: Array<number> = <Array<number>>(<any>Object.keys(errorMap)); // I don't know why TS doesn't catch this
    for (const errInstance of keys) {
      if (error & errInstance) {
        let errMsg = errorMap[errInstance];
        if (typeof errMsg === "function") {
          // @ts-ignore
          errMsg = errMsg();
        }

        errParts.push(`<li>${errorMap[errInstance]}</li>`);
      }
    }

    errParts.push("</ul><p>Please take care of these problems before submitting again.</p>");
    errorList.html(errParts.join(""));
  }
}
