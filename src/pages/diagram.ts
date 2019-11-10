// BSD LICENSE - c John Nunley and Larson Rivera

// leaderboard generator
import * as nunjucks from "nunjucks";

import { Attendance } from "./../attendance";
import { Student } from "./../student";

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
     <input type="checkbox" id="event-checkbox={{eventId}} name="event-checkbox-{{eventId}} />
   </td>`;
const tableEnd = 
    `</table>`;

export default async function getDiagramHTML(page: number): Promise<string> {


  // sew it all together
  let parts = [tableHeader];
  
  async function generateRow(index: number, student: Student): Promise<void> {
    console.log(`StudentId is ${student.studentId}`);
    const row = nunjucks.renderString(tableBody, {
      name: `${student.first} ${student.last}`,
      leadershipPoints: await Attendance.getUserPoints(student.studentId)
    });
    parts[index] = row;
  }

  let promises = [];
  let students = await Student.loadAll(page, limit);

  if (students.length === 0) return "<p>No students yet...</p>";
  
  // generate promises
  for (let i = 0; i < students.length; i++) {
    promises.push(generateRow(i + 1, students[i]));
  }

  await Promise.all(promises);

  parts.push(tableEnd);
  return parts.join("\n");
}
