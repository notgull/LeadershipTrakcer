/*
 * src/pages/manage-students.ts
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

import { Student } from "../student";

import * as nunjucks from "nunjucks";

const tableHeader =
  `<table>
   <tr>
   <th>Name</th>
   <th colspan="2">Actions</th>
   </tr>`;
const tableBody = 
  `<tr>
   <td>{{ first }} {{ last }}</td>
   <td><a href="/change-rp?studentid={{ studentId }}">Add/Subtract Leadership Points</a></td>
   <td><a href="/delete-student?studentid={{studentId }}">Delete Student</a></td>
   </tr>`;
const tableEnd = `</table>`;


// manage students via admin console
export default async function getStudentManagerHTML(page: number): Promise<string> {
  const students = await Student.loadAll(page, 20);
   
  let table = [tableHeader];
  for (const student of students) {
    table.push(nunjucks.renderString(tableBody, {
      studentId: student.studentId,
      first: student.first,
      last: student.last
    }));
  }
  table.push(tableEnd);

  return table.join("\n");
}
