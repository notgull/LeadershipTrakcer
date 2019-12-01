/*
 * src/student.ts
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

import { Belt, parseBelt } from "./belt";
import { Nullable } from "./utils";
import { query } from "./sql";

export enum SortStudentBy  {
  Name = "last ASC, first ASC",
  Points = "getUserPoints(studentId)"
}

export class Student  {

  //Instance Variables
  first: string;
  last: string;
  belt: Belt;
  rp: number;
  studentId: number;
  userId: number;

  constructor(f: string, l: string, b: Belt, r: number) {  // first name, last name, belt color, ranking points (rp)
    this.first = f;
    this.last = l;
    this.belt = b;
    this.rp = r;
    this.studentId = -1;
    this.userId = -1;
  }

  updateName(newFirst: string, newLast: string) {  // Changes the student's name
    this.first = newFirst;
    this.last = newLast;
  }


  getAttribute(attribute: string) {  // Returns the Attribute based on keywords: "first" (first name) "last" (last name) "belt" (belt color) "rp" (ranking points)
    attribute = attribute.toLowerCase();  // turn the parameter to lower toLowerCase

    // Return the appropriate variable
    if (attribute == "first")
      return this.first;

    else if (attribute == "last")
      return this.last;

    else if (attribute == "belt")
      return this.belt;

    else if (attribute == "rp")
      return this.rp;

    // otherwise, it's an error
    return "Err";
  }

  // instantiate a student from a row-like object
  static fromRow(row: any): Student {
    const s = new Student(row.first, row.last, <Belt>row.belt, row.rp);
    s.userId = parseInt(row.userid, 10);
    s.studentId = parseInt(row.studentid, 10);
    return s;
  }

  // load a student by its student id from the sql
  static async loadById(studentId: number): Promise<Nullable<Student>> {
    let res = await query("SELECT * FROM Students WHERE studentId=$1;", [studentId]);
    if (res.rowCount === 0) return null;
    return Student.fromRow(res.rows[0]);
  }

  // load a student by which users own it
  static async loadByUser(userId: number): Promise<Array<Student>> {
    const res = await query("SELECT * FROM Students WHERE userId=$1;", [userId]);
    let array = [];

    for (const row of res.rows) {
      array.push(Student.fromRow(row));
    }

    return array;
  }

  // load a student by first and last name
  static async loadByFirstAndLastName(first: string, last: string): Promise<Nullable<Student>> {
    const res = await query("SELECT * FROM Students WHERE first=$1 AND last=$2;", [first, last]);
    if (res.rowCount === 0) return null;
    return Student.fromRow(res.rows[0]);
  }

  // load all students
  static async loadAll(page: number, limit: number, sortByName: boolean = true): Promise<Array<Student>> {
    let sortBy;
    if (sortByName) {
      sortBy = "last ASC, first ASC";
    } else {
      sortBy = "getUserPoints(studentId) DESC";
    }

    const offset = page * limit;
    let res = await query(`SELECT * FROM Students ORDER BY ${sortBy} OFFSET $1 LIMIT $2;`, [offset, limit]);
    if (res.rowCount === 0) return [];
    else {
      return res.rows.map((row: any) => {
        return Student.fromRow(row);
      });
    }
  }

  // submit a student into the database
  async submit(): Promise<void> {
    if (this.studentId === -1) {
      let res = await query(`INSERT INTO Students (first,last,belt,rp,userId)
                             VALUES ($1, $2, $3, $4, $5) RETURNING studentid;`,
                            [this.first, this.last, this.belt, this.rp, this.userId]);
      this.studentId = parseInt(res.rows[0].studentid, 10);
    } else {
      let res = await query(`UPDATE Students SET first=$1, last=$2, belt=$3, rp=$4 WHERE studentId=$5;`,
                            [this.first, this.last, this.belt, this.rp, this.studentId]);
      // NOTE: we shouldn't need to update the user id
    }
  }

  // test to see if a f/l combination exists
  static async checkCombination(first: string, last: string): Promise<boolean> {
    let res = await query("SELECT * FROM Students WHERE first=$1 AND last=$2;", [first, last]);
    return res.rowCount > 0;
  }
}
