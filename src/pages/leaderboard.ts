// BSD LICENSE - c John Nunley and Larson Rivera

// leaderboard generator
import * as nunjucks from "nunjucks";

import { Student } from "./../student";

const limit = 10;

export default async function getLeaderboardHTML(page: number): Promise<string> {
  const tableHeader =
    `<table>
       <tr>
         <th>Name</th>
         <th>Leadership Points</th>
       </tr>`; // TODO: events and such
  const tableBody = 
    `  <tr>
         <td>{{ name }}</td>
         <td>{{ leadershipPoints }}</td>
       </tr>`;
  const tableEnd = 
    `</table>`;

  // sew it all together
  let parts = [tableHeader];
  
  async function generateRow(index: number, student: Student): Promise<void> {
    const row = nunjucks.renderString(tableBody, {
      name: `${student.first} ${student.last}`,
      leadershipPoints: student.rp
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
