/*
  Main Student Class
  Larson Rivera
*/

// BSD LICENSE - c John Nunley and Larson Rivera

import { Belt, parseBelt } from "./belt";
import { query } from './sql';

export enum SortStudentBy  {
  Name = "last, first",
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
    s.userId = row.userId;
    return s;
  }

  // load a student by its student id from the sql
  static async loadById(studentId: number): Promise<Student | null> {
    let res = await query("SELECT * FROM Students WHERE studentId=$1;", [studentId]);
    if (res.rowCount === 0) return null;
    return Student.fromRow(res.rows[0]);
  }

  // load all students
  static async loadAll(page: number, limit: number): Promise<Array<Student>> {
    const offset = page * limit;
    let res = await query("SELECT * FROM Students ORDER BY last ASC, first ASC OFFSET $1 LIMIT $2;", [offset, limit]);
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
      this.studentId = res.rows[0].studentid;
    } else {
      let res = await query(`UPDATE Students SET first=$1, last=$2, belt=$3, rp=$4 WHERE studentId=$5;`,
                            [this.first, this.last, this.belt, this.rp, this.studentId]);
      // NOTE: we shouldn't need to update the user id
    }
  }

  // test to see if a f/l combination exists
  static async checkCombination(first: string, last: string): Promise<boolean> {
    let res = await query("SELECT * FROM Students WHERE first=$1 and last=$2;", [first, last]);
    return res.rowCount > 0;
  }
}
