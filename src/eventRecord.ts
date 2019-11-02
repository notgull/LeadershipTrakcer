/*
  Main Event Class
  Larson Rivera
*/

// BSD LISENCE - c John Nunley and Larson Rivera

class EventRecord {
  name: string;
  pts: number;

  constructor(n: string, p: number) { // Constructor to create a named event with the number of points it needs to add
    this.name = n;
    this.pts = p;
  }
}
