/*
 * src/schema.ts
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

import { query } from './sql';

// initialize basic database schema
export async function initializeSchema(): Promise<void> {
  const studentTableSql = `CREATE TABLE IF NOT EXISTS Students (
                             studentId BIGSERIAL PRIMARY KEY,
                             first TEXT NOT NULL,
                             last TEXT NOT NULL,
                             belt TEXT NOT NULL,
                             rp INTEGER,
                             userId INTEGER REFERENCES Users(userId));`;
  const userTableSql = `CREATE TABLE IF NOT EXISTS Users (
                          userId BIGSERIAL PRIMARY KEY,
                          username TEXT NOT NULL,
                          email TEXT NOT NULL,
                          pwhash TEXT NOT NULL,
                          salt TEXT NOT NULL,
                          isAdmin BOOLEAN NOT NULL);`;
  const eventTableSql = `CREATE TABLE IF NOT EXISTS Events (
                           eventId BIGSERIAL PRIMARY KEY,
                           name TEXT NOT NULL,
                           points INTEGER NOT NULL,
                           date TIMESTAMP NOT NULL,
                           description TEXT NOT NULL);`;
  const attendanceTableSql = `CREATE TABLE IF NOT EXISTS Attendance (
                                studentId INTEGER REFERENCES Students(studentId),
                                eventId INTEGER REFERENCES Events(eventId),
                                attended BOOLEAN NOT NULL);`;
  const userPointsFunctionSql = 
    `CREATE OR REPLACE FUNCTION getUserPoints(sid BIGINT)
       RETURNS INTEGER AS $$
       declare
         total INTEGER;
         rpval INTEGER;
       BEGIN
         SELECT SUM(Events.points) INTO total
         FROM Attendance
         INNER JOIN Events ON Attendance.eventId=Events.eventId
         INNER JOIN Students ON Students.studentId=Attendance.studentId
         WHERE Students.studentId = sid AND Attendance.attended;
         SELECT Students.rp INTO rpval FROM Students WHERE Students.studentId = sid LIMIT 1;
         RETURN COALESCE(total + rpval, 0);
       END; $$
       LANGUAGE PLPGSQL;`;
  const quarterPointsFunctionSql = 
    `CREATE OR REPLACE FUNCTION getQuarterPoints(sid BIGINT)
       RETURNS INTEGER AS $$
       declare
         total INTEGER;
         rpval INTEGER;
       BEGIN
         SELECT SUM(Events.points) INTO total
         FROM Attendance
         INNER JOIN Events ON Attendance.eventId=Events.eventId AND extract(quarter from Events.date)=extract(quarter from now()) AND extract(year from Events.date)=extract(year from now())
         INNER JOIN Students ON Students.studentId=Attendance.studentId
         WHERE Students.studentId = sid AND Attendance.attended;
         SELECT Students.rp INTO rpval FROM Students WHERE Students.studentId = sid LIMIT 1;
         RETURN COALESCE(total + rpval, 0);
       END; $$
       LANGUAGE PLPGSQL;`;

  
  await query(userTableSql, []);
  await query(studentTableSql, []);
  await query(eventTableSql, []);
  await query(attendanceTableSql, []);
  await query(userPointsFunctionSql, []);
  await query(quarterPointsFunctionSql, []);
}
