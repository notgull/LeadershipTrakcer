// BSD LICENSE - c John Nunley and Larson Rivera

const chai = require("chai");
const { assert, expect } = chai;
chai.use(require("chai-http"));

const { Attendance } = require("../dist/backend/attendance");
const { EventRecord } = require("../dist/backend/eventRecord")
const { getServer } = require("../dist/backend/server");
const { removeAll } = require("../bin/reset_db");
const { Student } = require("../dist/backend/student");
const { User } = require("../dist/backend/users");

// setup testing environment
let student1;
const student1First = "John";
const student1Last = "Nunley";
const student1Belt = "Black";
const student1Rp = 40;

let student2;
const student2First = "Gray";
const student2Last = "Smith";
const student2Belt = "Red";
const student2Rp = 13;

let user1;
const user1Username = "user1";
const user1Password = "password1";
const user1Email = "user1@test.com";

let user2;
const user2Username = "user2";
const user2Password = "password2";
const user2Email = "user2@test.com";

let event1;
const event1Title = "LeadershipTrakcer Testing";
const event1Points = 200;
const event1Date = new Date();
const event1Desc = "Testing";

let event2;
const event2Title = "11/09/18 Special Training";
const event2Points = 100;
const event2Date = new Date("11/09/18");
const event2Desc = "special train";

let server;

before(async () => {
  // clear the database
  try {
    await removeAll();
  } catch (err) {
    // do nothing
  }

  // open server
  server = await getServer();

  // setup database testing
  user1 = await User.createNewUser(user1Username, user1Password, user1Email, false);
  user2 = await User.createNewUser(user2Username, user2Password, user2Email, true);
 
  student1 = new Student(student1First, student1Last, student1Belt, student1Rp);
  student1.userId = user1.userId;
  await student1.submit();

  student2 = new Student(student2First, student2Last, student2Belt, student2Rp);
  student2.userId = user2.userId;
  await student2.submit();

  event1 = new EventRecord(event1Title, event1Points, event1Date, event1Desc);
  await event1.submit();

  event2 = new EventRecord(event2Title, event2Points, event2Date, event2Desc);
  await event2.submit();

  await Attendance.setAttendance(student1.studentId, event1.eventId, true);
  await Attendance.setAttendance(student2.studentId, event1.eventId, true);
  await Attendance.setAttendance(student1.studentId, event2.eventId, true);
  await Attendance.setAttendance(student2.studentId, event2.eventId, false);

  console.log = function() { };
});

describe("Testing user systems", () => {
  describe("Ensuring user integrity", () => {
    let testUser;

    // make sure the user loads properly
    it("Load user from database", async () => {
      testUser = await User.loadByUsername(user1Username);
    });
    it("#userId", () => { expect(testUser).to.have.property("userId", user1.userId); });
    it("#username", () => { expect(testUser).to.have.property("username", user1.username); });
    it("#pwhash", () => { expect(testUser).to.have.property("pwhash", user1.pwhash); });
    it("#salt", () => { assert(Buffer.compare(testUser.salt, user1.salt) === 0); });
    it("#email", () => { expect(testUser).to.have.property("email", user1.email); });
    it("#isAdmin", () => { expect(testUser).to.have.property("isAdmin", user1.isAdmin); });
  });

  describe("Testing login interface", () => {
    it("Login as existing user", (done) => {
      const userData = {
        username: user1Username,
        password: user1Password
      };

      chai.request(server).post("/process-login").type("form").send(userData).end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.redirect;
        done();
      });
    });
  });
});
