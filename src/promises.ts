// BSD LICENSE - c John Nunley and Larson Rivera

import { readFile as readFileCB } from "fs";
import { promisify } from "util";

export const readFile = promisify(readFileCB);
