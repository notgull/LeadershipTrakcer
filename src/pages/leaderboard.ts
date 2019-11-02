// BSD LICENSE - c John Nunley and Larson Rivera

// leaderboard generator
import * as nunjucks from "nunjucks";

import { Attendance } from "./../attendance";
import { Student, SortStudentBy } from "./../student";

const limit = 50;

export default async function getLeaderboardHTML(page: number): Promise<string> {
  const tableHeader = 
    `<table>
      <tr>
        <th>Place</th>
        <th>Name</th>
        <th>Leadership Points</th>
      </tr>`;
  const tableBody =
    `  <tr>
         <td>{{ order }}</td>
         <td>{{ name }}</td>
         <td>{{ leadershipPoints }}</td>
       </tr>`;
  const tableEnd = 
    `</table>`;

  let parts = [tableHeader];

  async function generateRow(index: number, student: Student, placing: number) {
    let points = await Attendance.getUserPoints(student.studentId);
    const row = nunjucks.renderString(tableBody, {
      name: `${student.first} ${student.last}`,
      order: placing,
      leadershipPoints: points
    });
    parts[index] = row;
  }

  let promises = [];
  let students = await Student.loadAll(page, limit, SortStudentBy.Points);
  
  if (students.length === 0) return "<p>No students yet...</p>";

  for (let i = 0; i < students.length; i++) {
    promises.push(generateRow(i+1, students[i], i+1));
  }

  await Promise.all(promises);

  return parts.join("\n");
}
