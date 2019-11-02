// BSD LICENSE - c John Nunley and Larson Rivera

// leaderboard generator
import * as nunjucks from "nunjucks";

import { Attendance } from "./../attendance";
import { Student } from "./../student";

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

  async function generateRow(index: number) {

  }

  return parts.join("\n");
}
