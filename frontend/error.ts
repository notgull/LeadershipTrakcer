// BSD LICENSE - c John Nunley and Larson Rivera

import { getParameter } from "./parameter";

// handle errors in a default way
export type ErrorMap = { [key: number]: string | () => string };

// process errors from parameter
export function processErrors(errorMap: ErrorMap) {
  const errorParam = getParameter("errors");
  if (errorParam) {
    const error = parseInt(errorParam, 10);
    let errorList = document.getElementById("errorMessage");
    if (!errorList) {
      errorList = document.createElement("div");
      errorList.id = "errorMessage";
      document.body.appendChild(errorList);
    }

    errorList.innerHTML = "<p>Unfortunately, we were unable to process your request for the following reasons:</p><ul";

    let keys: Array<number> = <Array<number>>(<any>Object.keys(errorMap)); // I don't know why TS doesn't catch this
    for (const errInstance of keys) {
      if (error & errInstance) {
        let errMsg = errorMap[errInstance];
        if (errMsg instanceof function) {
          errMsg = errMsg();
        }

        errorList.innerHTML += `<li>${errorMap[errInstance]}</li>`;
      }
    }

    errorList.innerHTML += "</ul><p>Please take care of these problems before submitting again.</p>";
  }
}
