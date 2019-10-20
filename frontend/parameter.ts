// BSD LICENSE - c John Nunley and Larson Rivera
import { parse as queryparse, ParsedUrlQuery } from "querystring";

import { Nullable } from "./utils";

// get url parameters
export function getParameters(): ParsedUrlQuery {
  const args = window.location.search.substr(1);
  return queryparse(args);
}

export function getParameter(parameterName: string): Nullable<string> {
  const parameters = getParameters();
  if (parameters.hasOwnProperty(parameterName)) {
    const parameter = parameters[parameterName];
    if (parameter instanceof Array) throw new Error("Unhandled edge case: parameter is array");
    return parameter;
  } else {
    return null;
  }
}
