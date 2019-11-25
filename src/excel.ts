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

import { Belt, parseBelt } from "./belt";
import { EventRecord } from "./eventRecord";
import { exists } from "./promises";
import { query } from "./sql";
import { Student } from "./student";
import { User } from "./users";

const config = require(path.join(process.cwd(), "config.json"));
const nameRegex = /(\w+), (\w+)[^ ]/;

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

  const workbook = new excel.Workbook();
  try {
    await workbook.xlsx.readFile(filename);
  } catch (err) {
    console.log(`Unable to read xlsx file: ${err}`);
    return;
  }

  let belt: Belt;
  let first: string;
  let last: string
  let cell, event, reResult, student;
  let promises: Array<Promise<void>> = [];

  let eventColKey: { [key: Array<number>]: EventRecord } = {};

  // run function on each worksheet
  workbook.worksheets.slice().reverse().forEach((worksheet: excel.Worksheet, index: number) => {
    // read each row of the sheet
    worksheet.eachRow((row: excel.Row) => {
      cell = row.getCell(2);
      if (!nameRegex.test(<string>cell.value)) return; // if the cell isn't a name cell, get out of here

      // create a student if they don't exist already 
      [last, first] = <Array<string>>nameRegex.exec(<string>cell.value);
      promises.push((async () => {
        if (!(await Student.checkCombination(first, last))) {
          belt = parseBelt(<string>row.getCell(3).value);
          if (!belt) return;

          student = new Student(first, last, belt, 0);
          await student.submit();
        }
      })());
    });

    // read each event of the sheet
    let num = 0;
    worksheet.eachColumnKey((column: Partial<excel.Column>, colIndex: number) => {
      // skip first 3 columns
      if (num < 3) {
        num++;
        return;
      }

      let name = <string>column.values[1];
      let date = new Date(Date.parse(<string>column.values[2]));
      let points = parseInt(<string>column.values[3], 10);
      let description = "Excel imported event";

      if (name && date && points && description) {
        event = new EventRecord(name, points, date, description);
        promises.push(event.submit());
        eventColKey[ [index, colIndex] ] = event;
      }
    });
  });

  // run all promises
  await Promise.all(promises);
  promises = [];

  // set attendance
  workbook.worksheets.slice().reverse().forEach((worksheet: excel.Worksheet, index: number) => {
    worksheet.eachRow((row: excel.Row) => {
      if (!nameRegex.test(<string>row.getCell(2).value)) return; // skip no-name cells

      // iterate over columns within the row
      row.eachCell((cell: excel.Cell, colIndex: number) {
        // if there's a value within the row, we assume that they were there
        if (cell.value && cell.value > 0) {
          event = eventColKey[ [index, colIndex] ];
        }
      });
    }); 
  }); 
}
