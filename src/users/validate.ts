// BSD LICENSE - c John Nunley and Larson Rivera

import { pbkdf2 as pbkdf2CB } from "crypto";
import { promisify } from "util";

const pbkdf2 = promisify(pbkdf2CB);

export async function hashPassword(password: string, salt: Buffer): string {
  return (await pbkdf2(password, salt, 100000, 64, "sha512")).toString("hex");
}
