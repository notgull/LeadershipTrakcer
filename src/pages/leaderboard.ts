/*
 * src/pages/leaderboard.ts
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

// leaderboard generator
import * as nunjucks from "nunjucks";

import { Attendance } from "./../attendance";
import { Student } from "./../student";

const limit = 50;

export default async function getLeaderboardHTML(page: number): Promise<string> {
  const tableHeader = 
    `<table border="1">
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
  let students = await Student.loadAll(page, limit, false);
  
  if (students.length === 0) return "<p>No students yet...</p>";

  for (let i = 0; i < students.length; i++) {
    promises.push(generateRow(i+1, students[i], i+1));
  }

  await Promise.all(promises);

  return parts.join("\n");
}
