// BSD LICENSE - c John Nunley and Larson Rivera

import { Nullable } from "./utils";
import { query } from "./sql";

export type AttendanceList = { [studentId: number]: boolean }; 

export class Attendance {
  // get all of the user points
  static async getUserPoints(studentId: number): Promise<number> {
    let res = await query("SELECT getUserPoints($1) as totalpoints;", [studentId]);
    //console.log(res);

    if (res.rowCount === 0) return 0; 

    console.log(`Resulting user point total is ${res.rows[0].totalpoints}`);

    return res.rows[0].totalpoints;
  }

  static async setAttendance(studentId: number, eventId: number, attended: boolean): Promise<void> {
    let res = await query("SELECT studentId FROM Attendance WHERE studentId=$1 AND eventId=$2;", 
                          [studentId, eventId]);
    if (res.rowCount === 0) {
      // we must insert the row in
      await query("INSERT INTO Attendance VALUES ($1, $2, $3);", [studentId, eventId, attended]);
    } else {
      await query("UPDATE Attendance SET attended=$1 WHERE studentId=$1 AND eventId=$2;", [studentId, eventId]);
    }
  }

  static async getAttendance(studentId: number, eventId: number): Promise<boolean> {
    const res = await query("SELECT attended FROM Attendance WHERE studentId=$1 AND eventId=$2;",
                            [studentId, eventId]);
    if (res.rowCount === 0) return false;
    return res.rows[0].attended;
  }

  static async getAttendanceList(eventId: number): Promise<AttendanceList> {
    const res = await query("SELECT attended, studentId FROM Attendance WHERE eventId=$1;", [eventId]);
    let attendanceList: AttendanceList = {};
   
    for (const row of res.rows) {
      attendanceList[row.studentId] = row.attended;
    }

    return attendanceList;
  }
}
