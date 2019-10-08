/*
  Main Student Class
  Larson Rivera
*/

class Student {

  //Instance Variables
  private first: string;
  private last: string;
  private belt: string;
  private rp: number;


  constructor(f: string, l: string, b: string, r: number) {  // first name, last name, belt color, ranking points (rp)
    this.first = f;
    this.last = l;
    this.belt = b;
    this.rp = r;
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
}
