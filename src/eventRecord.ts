/*
 * src/eventRecord.ts
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
