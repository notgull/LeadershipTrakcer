/*
  Main Event Class
  Larson Rivera
*/

// BSD LISENCE - c John Nunley and Larson Rivera

import {query} from "./sql"

class EventRecord {
  name: string;
  points: number;
  date: Date;
  description: string;
  eventId: number;

  constructor(n: string, p: number, d: Date, des: string) { // Constructor to create a named event with the number of points it needs to add
    this.name = n;
    this.points = p;
    this.date = d;
    this.description = des;

    //SQL instantiate
    this.eventId = -1 // Just give the id a starting point
  }

  async pushQuery(): Promise<void>{
    let res = await query(`INSERT INTO Event (eventName, pts, date, eventId, description) VALUES ($1, $2, $3, $4, $5), RETURNING eventId;`,
                        [this.name, this.points, this.date, this.eventId, this.description]);

    this.eventId = res.rows[0].eventId; // Get the event id
  }

  // test to see if a f/l combination exists
  static async checkCombination(name: string, date: string): Promise<boolean> {
    let res = await query("SELECT * FROM Students WHERE =$1 and date=$3;", [name, date]);
    return res.rowCount > 0;
  }

}
