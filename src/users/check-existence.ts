// BSD LICENSE - c John Nunley and Larson Rivera

import { query } from "./../sql";

export async function checkUsernameUsage(username: string): Promise<boolean> {
  let res = await query("SELECT * FROM Users WHERE username=$1;", [username]);
  return res.rowCount > 0;
};

export async function checkEmailUsage(email: string): Promise<boolean> {
  let res = await query("SELECT * FROM Users WHERE email=$1;", [email]);
  return res.rowCount > 0;
};
