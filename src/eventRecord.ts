/*
  Main Event Class
  Larson Rivera
*/

// BSD LISENCE - c John Nunley and Larson Rivera

import {query} from "./sql"

class EventRecord {
  eventName: string;
  pts: number;
  date: Date;
  eventId: number;
  description: string;

  constructor(n: string, p: number, d: Date, des: string) { // Constructor to create a named event with the number of points it needs to add
    this.eventName = n;
    this.pts = p;
    this.date = d;
    this.description = des;

    //SQL instantiate
    this.eventId = -1 // Just give the id a starting point
  }

  async pushQuery(): Promise<void>{
    let res = await query(`INSERT INTO Event (eventName, pts, date, eventId, description) VALUES ($1, $2, $3, $4, $5), RETURNING eventId;`,
                        [this.eventName, this.pts, this.date, this.eventId, this.description]);

    this.eventId = res.rows[0].eventId; // Get the event id

  }

}
