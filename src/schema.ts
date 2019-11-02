// BSD LICENSE - c John Nunley and Larson Rivera

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
                           eventName TEXT NOT NULL,
                           points INTEGER NOT NULL,
                           date TIMESTAMP NOT NULL,
                           description TEXT NOT NULL);`;
  const attendanceTableSql = `CREATE TABLE IF NOT EXISTS Attendance (
                                studentId INTEGER REFERENCES Students(studentId),
                                eventId INTEGER REFERENCES Events(eventId),
                                attended BOOLEAN NOT NULL);`;
  const userPointsFunctionSql = 
    `CREATE OR REPLACE FUNCTION getUserPoints(sid INTEGER)
       RETURNS INTEGER AS $$
       declare
         total INTEGER;
       BEGIN
         SELECT SUM(Events.points) INTO total
         FROM Attendance
         INNER JOIN Events ON Attendance.eventId=Events.eventId
         WHERE Attendance.studentId = sid;
         RETURN total;
       END; $$
       LANGUAGE PLPGSQL;`;

  
  await query(userTableSql, []);
  await query(studentTableSql, []);
  await query(eventTableSql, []);
  await query(attendanceTableSql, []);
  await query(userPointsFunctionSql, []);
}
