// BSD LICENSE - c John Nunley and Larson Rivera

// leaderboard generator
import * as nunjucks from "nunjucks";

import { Attendance, AttendanceList } from "./../attendance";
import { EventRecord } from "./../eventRecord";
import { Student } from "./../student";

nunjucks.configure({ autoescape: false });

const limit = 30;

const numEvents = 8;

const tableHeader =
    `<table>
       <tr>
         <th>Name</th>
         <th>Leadership Points</th>
       </tr>`; // TODO: events and such
const tableBody = 
    `  <tr>
         <form id="event-diagram-{{studentId}}">
           <td>{{ name }}</td>
           {{ events }}
           <td>{{ leadershipPoints }}</td>
         </form>
       </tr>`;
const eventBody = 
  `<td>
     <input type="checkbox" id="event-checkbox={{eventId}} name="event-checkbox-{{eventId}}" {{checked}} />
   </td>`;
const tableEnd = 
    `</table>`;

export default async function getDiagramHTML(page: number, eventPage: number): Promise<string> {
  // sew it all together
  let parts = [tableHeader];

  let promises = [];

  // load both the most recent students and most recent events
  let results = await Promise.all([
    Student.loadAll(page, limit),
    EventRecord.loadAll(eventPage, numEvents)
  ]);
  const students = results[0];
  const events = results[1];

  // also get the attendance record
  let eventAttendance: Array<AttendanceList> = await Promise.all(events.map(
    function(value: EventRecord): Promise<AttendanceList> {
      return Attendance.getAttendanceList(value.eventId);
    }
  ));

  if (students.length === 0) return "<p>No students yet...</p>";

  // functions to generate HTML  
  function generateEventCheckboxes(studentId: number): string {
    let checkboxes = [];
    let eventId, attendanceList;
    for (let i = 0; i < events.length; i++) {
      eventId = events[i].eventId;
      attendanceList = eventAttendance[i];

      // student id is key in the event list
      checkboxes.push(nunjucks.renderString(eventBody, {
        eventId: eventId,
        checked: attendanceList[studentId] ? "checked" : ""  
      })); 
    }
    return checkboxes.join("\n");
  }

  async function generateRow(index: number, student: Student): Promise<void> {
    console.log(`StudentId is ${student.studentId}`);
    const row = nunjucks.renderString(tableBody, {
      events: generateEventCheckboxes(student.studentId),
      name: `${student.first} ${student.last}`,
      leadershipPoints: await Attendance.getUserPoints(student.studentId),
      studentId: student.studentId
    });
    console.log(row);
    parts[index] = row;
  }

  // generate promises
  for (let i = 0; i < students.length; i++) {
    promises.push(generateRow(i + 1, students[i]));
  }

  await Promise.all(promises);

  parts.push(tableEnd);
  return parts.join("\n");
}
