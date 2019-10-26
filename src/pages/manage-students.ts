// BSD LICENSE - c John Nunley and Larson Rivera

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
