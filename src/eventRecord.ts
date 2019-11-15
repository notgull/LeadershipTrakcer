/*
  Main Event Class
  Larson Rivera
*/

// BSD LISENCE - c John Nunley and Larson Rivera

import { Nullable } from "./utils";
import { query } from "./sql"

export class EventRecord {
  eventName: string;
  pts: number;
  date: Date;
  description: string;
  eventId: number;

  constructor(n: string, p: number, d: Date, des: string) { // Constructor to create a named event with the number of points it needs to add
    this.eventName = n;
    this.pts = p;
    this.date = d;
    this.description = des;

    //SQL instantiate
    this.eventId = -1 // Just give the id a starting point
  }

  async submit(): Promise<void>{
    let res = await query(`INSERT INTO Events (name, points, date, description) 
                           VALUES ($1, $2, $3, $4) RETURNING eventid;`,
                          [this.eventName, this.pts, this.date, this.description]);

    this.eventId = res.rows[0].eventid; // Get the event id
    console.log(`Returned eventId ${this.eventId}`);
  }

  // test to see if a f/l combination exists
  static async checkCombination(name: string, date: string): Promise<boolean> {
    let res = await query("SELECT * FROM Events WHERE name=$1 and date=$3;", [name, date]);
    return res.rowCount > 0;
  }

  static fromRow(row: any): EventRecord {
    let ev = new EventRecord(row.name, row.points, row.date, row.description);
    ev.eventId = row.eventid;
    return ev;
  }

  static async loadById(id: number): Promise<Nullable<EventRecord>> {
    let res = await query("SELECT * FROM Events where eventId=$1;", [id]);
    if (res.rowCount === 0) return null;
    return EventRecord.fromRow(res.rows[0]);
  }

  // load all in database
  static async loadAll(page: number = 0, limit: number = 9999): Promise<Array<EventRecord>> {
    const offset = page * limit;

    let res = await query("SELECT * FROM Events ORDER BY date DESC OFFSET $1 LIMIT $2;", [offset, limit]);
    let array = [];
    for (const row of res.rows) {
      array.push(EventRecord.fromRow(row));
    }
    return array;
  }
}
