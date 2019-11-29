/*
 * src/excel.ts
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

// read in information from an excel spreadsheet into the database
import * as excel from "exceljs";
import * as path from "path";

import { Attendance } from "./attendance";
import { Belt, parseBelt } from "./belt";
import { EventRecord } from "./eventRecord";
import { exists } from "./promises";
import { query } from "./sql";
import { Student } from "./student";
import { User } from "./users";

const config = require(path.join(process.cwd(), "config.json"));
const nameRegex = /(\w+), (\w+)/;

const timeout = async(ms: number) => new Promise((resolve: any) => setTimeout(resolve, ms));

export async function readSpreadsheet(filename: string): Promise<void> {
  if (!(await exists(filename))) {
    console.log(`File ${filename} does not exist`);
    return;
  }

  // before all, create a user to assign students to
  const user = await User.createNewUser(
    config.default_excel_username,
    config.default_excel_password,
    config.default_excel_email,
    false
  );
  const { userId } = user;
  console.log(userId);

  const workbook = new excel.Workbook();
  try {
    await workbook.xlsx.readFile(filename);
  } catch (err) {
    console.log(`Unable to read xlsx file: ${err}`);
    return;
  }

  let belt: Belt;
  let first: string;
  let last: string;
  let event: EventRecord;
  let cell, reResult, student;
  let promises: Array<Promise<void>> = [];
  let eventPromises: Array<Promise<void>> = [];

  let students: Array<Student> = [];
  let events: Array<EventRecord> = [];

  let eventColKey: Array<Array<EventRecord>> = new Array(workbook.worksheets.length);
  for (let i = 0; i < workbook.worksheets.length; i++) {
    eventColKey[i] = new Array(workbook.worksheets[i].columnCount);
    for (let j = 0; j < workbook.worksheets[i].columnCount; j++) {
      eventColKey[i][j] = new EventRecord("__ignore", 0, new Date(), "Excel imported event");
    }
  }

  console.log(eventColKey[0].length);

  // run function on each worksheet
  workbook.worksheets.slice().reverse().forEach((worksheet: excel.Worksheet, index: number) => {
    index = workbook.worksheets.length - (index);

    // read each row of the sheet
    worksheet.eachRow((row: excel.Row) => {
      cell = row.getCell(2);
      if (!nameRegex.test(<string>cell.value)) return; // if the cell isn't a name cell, get out of here

      // create a student if they don't exist already 
      [,last,first] = <Array<string>>nameRegex.exec(<string>cell.value);
  
      belt = parseBelt(<string>row.getCell(3).value);
      if (!belt) { console.log("Belt not found"); return; }

      student = new Student(first, last, belt, 0);
      student.userId = userId;
        
      students.push(student);   
    });

    // read each event of the sheet
    worksheet.getSheetValues().slice(1, 4).forEach((row: excel.Row, rIndex: number) => {
      let num = 0;
      let cIndex = 0;

      // @ts-ignore
      row.forEach((value: string) => {
        console.log(cIndex);

        if (num < 3) {
          num++;
          return;
        }

        const wIndex = index - 1;

        if (rIndex === 0) {
          eventColKey[wIndex][cIndex].eventName = value;
        } else if (rIndex === 1) {
          eventColKey[wIndex][cIndex].date = new Date(/*Date.parse(value)*/);
        } else if (rIndex === 2) {
          eventColKey[wIndex][cIndex].pts = parseInt(value, 10) || 0;
        }

        cIndex++;
      });
    });
  });

  // run all promises
  // note: this process runs better if it is synchronous
  for (const uStudent of students) {
    if (!(await Student.checkCombination(uStudent.first, uStudent.last))) {
      await uStudent.submit();
    }
  }

  for (const eventRow of eventColKey) {
    for (const uEvent of eventRow) {
      if (uEvent.eventName !== "__ignore") {
        await uEvent.submit();
      }
    }
  }

  console.log(eventColKey);

  // set attendance
  workbook.worksheets.slice().reverse().forEach((worksheet: excel.Worksheet, index: number) => {
    worksheet.eachRow((row: excel.Row) => {
      if (!nameRegex.test(<string>row.getCell(2).value)) return; // skip no-name cells

      try {
        [,last,first] = nameRegex.exec(<string>row.getCell(2).value);

        // iterate over columns within the row
        row.eachCell((cell: excel.Cell, colIndex: number) => {
          let cEvent = eventColKey[index][colIndex];
          promises.push((async function(
            first: string, 
            last: string, 
            cEvent: EventRecord, 
            cell: excel.Cell
          ) {
            let cStudent = await Student.loadByFirstAndLastName(first, last);  
 
            // if there's a value within the row, we assume that they were there
            const wasThere: boolean = cell.value && cell.value > 0;
            console.log(`${first} ${last} did ${wasThere ? "" : "not "} attend event ${cEvent.eventName}`);
            await Attendance.setAttendance(cStudent.studentId, cEvent.eventId, wasThere);  
          })(first,last, cEvent, cell));
        });
      } catch (err) {
        console.error(err);       
      }
    }); 
  }); 

  await Promise.all(promises);
}
