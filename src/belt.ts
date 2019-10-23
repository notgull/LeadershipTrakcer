// BSD LICENSE - c John Nunley and Larson Rivera

import { Nullable } from "./utils";

// an enum consisting of all possible belt ranks
export type Belt = 
  | "ninjawhite"
  | "ninjaorange"
  | "ninjayellow"
  | "ninjagreen"
  | "ninjapurple"
  | "ninjablue"
  | "ninjabrown"
  | "ninjared"
  | "ninjablack"
  | "white"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "bluesr"
  | "brown"
  | "brownsr"
  | "red"
  | "redsr"
  | "candidate"
  | "black1"
  | "black2"
  | "black3"
  | "black4"
  | "black5"
  | "black6";

const mainRanks = [
  "white",
  "orange",
  "yellow",
  "green",
  "blue",
  "brown",
  "red"
];

export function parseBelt(input: string): Nullable<Belt> {
  input = input.toLowerCase();

  // test for black belt
  if (input.includes("black")) {
    if (input.includes("ninja")) return "ninjablack";
    if (input.includes("2")) return "black2";
    if (input.includes("3")) return "black3";
    if (input.includes("4")) return "black4";
    if (input.includes("5")) return "black5";
    if (input.includes("6")) return "black6";
    return "black1";
  }

  if (input.includes("candidate")) return "candidate";

  let isNinja = false;
  let mainRank = "";
  let isSenior = false;
  
  if (input.includes("ninja")) {
    isNinja = true;
  }

  if (!isNinja) {
    if (input.includes("high") || input.includes("senior") || input.includes("sr")) isSenior = true;
  }

  for (const rank of mainRanks) {
    if (input.includes(rank)) {
      mainRank = rank;
      break;
    }
  }

  // the big 'ol switch statement
  if (isSenior) {
    switch (mainRank) {
      case "red": return "redsr";
      case "brown": return "brownsr";
      case "blue": return "bluesr";
    } // fall through to next switch if there is no senior equivalent
  }

  if (isNinja) {
    switch (mainRank) {
      case "white": return "ninjawhite";
      case "orange": return "ninjaorange";
      case "yellow": return "ninjayellow";
      case "green": return "ninjagreen";
      case "blue": return "ninjablue";
      case "brown": return "ninjabrown";
      case "red": return "ninjared";
    } // fall through to next switch if there is no ninja equivalent
  }

  switch (mainRank) {
    case "white": return "white";
    case "orange": return "orange";
    case "yellow": return "yellow";
    case "green": return "green";
    case "blue": return "blue";
    case "brown": return "brown";
    case "red": return "red";
    default: return null;
  }
}
