// BSD LICENSE - c John Nunley and Larson Rivera

import { Nullable } from "./utils";
import { query } from "./sql";

export class Attendance {
  // get all of the user points
  static async getUserPoints(studentId: number): Promise<Nullable<number>> {
    let res = await query(
      `SELECT SUM(Events.points) AS totalpoints
       FROM Attendance
       WHERE Events.studentId = $1
       INNER JOIN Events ON Attendance.eventId=Events.eventId;`,
       [studentId]);
     
    let manual = (await query("SELECT rp FROM Students WHERE studentId=$1;", [studentId])).rows[0].rp;

    return res.rows[0].totalpoints + manual;
  }
}
