/*
 * src/attendance.ts
 * LeadershipTrakcer - Martial arts attendance logger
 *
 * Copyright (c) 2019, John Nunley and Larson Rivera
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { Nullable } from "./utils";
import { query } from "./sql";

export type AttendanceList = { [studentId: number]: boolean }; 

export class Attendance {
  // get all of the user points
  static async getUserPoints(studentId: number): Promise<number> {
    let res = await query("SELECT getUserPoints($1) as totalpoints;", [studentId]);
    //console.log(res);

    if (res.rowCount === 0) return 0; 

    if (!res.rows[0].totalpoints) return 0;

    return res.rows[0].totalpoints;
  }

  static async setAttendance(studentId: number, eventId: number, attended: boolean): Promise<void> {
    let res = await query("SELECT studentId FROM Attendance WHERE studentId=$1 AND eventId=$2;", 
                          [studentId, eventId]);
    if (res.rowCount === 0) {
      // we must insert the row in
      await query("INSERT INTO Attendance (studentId, eventId, attended) VALUES ($1, $2, $3);", [studentId, eventId, attended]);
    } else {
      await query("UPDATE Attendance SET attended=$1 WHERE studentId=$2 AND eventId=$3;", [attended, studentId, eventId]);
    }
  }

  static async getAttendance(studentId: number, eventId: number): Promise<boolean> {
    const res = await query("SELECT attended FROM Attendance WHERE studentId=$1 AND eventId=$2;",
                            [studentId, eventId]);
    if (res.rowCount === 0) return false;
    return res.rows[0].attended;
  }

  static async getAttendanceList(eventId: number): Promise<AttendanceList> {
    const res = await query("SELECT attended, studentid FROM Attendance WHERE eventId=$1;", [eventId]);
    let attendanceList: AttendanceList = {};
   
    for (const row of res.rows) {
      attendanceList[row.studentid] = row.attended;
    }

    return attendanceList;
  }
}
