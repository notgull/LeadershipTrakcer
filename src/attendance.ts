// BSD LICENSE - c John Nunley and Larson Rivera

import { Nullable } from "./utils";
import { query } from "./sql";

export class Attendance {
  // get all of the user points
  static async getUserPoints(studentId: number): Promise<number> {
    let res = await query(
      `SELECT SUM(Events.points) AS totalpoints
       FROM Attendance
       INNER JOIN Events ON Attendance.eventId=Events.eventId
       WHERE Attendance.studentId = $1;`,
       [studentId]);

    if (res.rowCount === 0) return 0;
     
    let manual = (await query("SELECT rp FROM Students WHERE studentId=$1;", [studentId]));
    let mPoints = 0;
    if (manual.rowCount > 0) mPoints = manual.rows[0].rp;

    return res.rows[0].totalpoints + mPoints;
  }
}
