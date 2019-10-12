/*
  Main Student Class
  Larson Rivera
*/

import { query } from './sql';

export class Student  {

  //Instance Variables
  first: string;
  last: string;
  belt: string;
  rp: number;
  studentId: number;

  constructor(f: string, l: string, b: string, r: number) {  // first name, last name, belt color, ranking points (rp)
    this.first = f;
    this.last = l;
    this.belt = b;
    this.rp = r;
    this.studentId = -1;
  }


  updateRp(rankingPoint: number) {  // Takes an intager and adds the value to the student's ranking point variable. Can be positive or negative
    this.rp += rankingPoint;
  }


  updateBelt(offset: number) {  // Takes an intager which signifies the number of belt levels the student is to increase or decrease by.
    // Followes standard belt progression:
    let belts: string[] = ["White", "Yellow", "Orange", "Green", "Purple", "Blue", "Blue Sr.", "Brown", "Brown Sr.", "Red", "Jr. Black", "Black"];

    // Update logic
    let newBelt = belts.indexOf(this.belt);  // get the position of the student's belt
    newBelt += offset;  // apply the offset
    this.belt = belts[newBelt];  // set the new color
  }


  updateName(newFirst: string, newLast: string) {  // Changes the student's name
    this.first = newFirst;
    this.last = newLast;
  }


  getAtribute(attribute: string) {  // Returns the Attribute based on keywords: "first" (first name) "last" (last name) "belt" (belt color) "rp" (ranking points)
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
    return new Student(row.first,
                       row.last,
                       row.belt,
                       row.rp);
  }

  // load a student by its student id from the sql
  static async loadById(studentId: number): Promise<Student | null> {
    let res = await query("SELECT * FROM Students WHERE studentId=$1;", [studentId]);
    if (res.rowCount === 0) return null;
    return Student.fromRow(res.rows[0]);
  }

  // submit a student into the database
  async submit(): Promise<void> {
    if (this.studentId === -1) {
      let res = await query(`INSERT INTO Students (first,last,belt,rp) 
                             VALUES $1, $2, $3, $3 RETURNING studentId;`,
                            [this.first, this.last, this.belt, this.rp]);
      this.studentId = res.rows[0].studentId;
    } else {
      let res = await query(`UPDATE Students SET first=$1, last=$2, belt=$3, rp=$4 WHERE studentId=$5;`,
                            [this.first, this.last, this.belt, this.rp, this.studentId]);
    } 
  }
}
