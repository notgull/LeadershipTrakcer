/*
  Main Event Class
  Larson Rivera
*/

// BSD LISENCE - c John Nunley and Larson Rivera

import { Nullable } from "./utils";
import { query } from "./sql"

class EventRecord {
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
    let res = await query(`INSERT INTO Events (eventName, pts, date, eventId, description) VALUES ($1, $2, $3, $4, $5), RETURNING eventId;`,
                        [this.eventName, this.pts, this.date, this.eventId, this.description]);

    this.eventId = res.rows[0].eventId; // Get the event id
  }

  // test to see if a f/l combination exists
  static async checkCombination(name: string, date: string): Promise<boolean> {
    let res = await query("SELECT * FROM Events WHERE name=$1 and date=$3;", [name, date]);
    return res.rowCount > 0;
  }

  static fromRow(row: any): EventRecord {
    let ev = new EventRecord(row.eventname, row.points, row.date, row.description);
    ev.eventId = row.eventid;
    return ev;
  }

  static async loadById(id: number): Promise<Nullable<EventRecord>> {
    let res = await query("SELECT * FROM Events where eventId=$1;", [id]);
    if (res.rowCount === 0) return null;
    return EventRecord.fromRow(res.rows[0]);
  }

  // load all in database
  static async loadAll(): Promise<Array<EventRecord>> {
    let res = await query("SELECT * FROM Events ORDER BY date DESC;", []);
  }
}
