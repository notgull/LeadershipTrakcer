// BSD LICENSE - c John Nunley and Larson Rivera

import { Nullable } from "./utils";
import { query } from "./sql";

export class Attendance {
  // get all of the user points
  static async getUserPoints(studentId: number): Promise<number> {
    let res = await query("SELECT getUserPoints($1) as totalpoints;", [studentId]);
    console.log(res);

    if (res.rowCount === 0) return 0; 

    console.log(`Resulting user point total is ${res.rows[0].totalpoints}`);

    return res.rows[0].totalpoints;
  }
}
