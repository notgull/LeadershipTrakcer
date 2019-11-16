// BSD LICENSE - c John Nunley and Larson Rivera

"use strict";

const chai = require("chai");
const { assert, expect } = chai;
chai.use(require("chai-http"));
const sinon = require("sinon");

const { JSDOM } = require("jsdom");

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

let errorFake;

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

  console.error = errorFake = sinon.spy();
});

describe("Testing user systems", () => {
  describe("Ensuring user integrity", () => {
    let testUser;

    // make sure the user loads properly
    it("load from database", async () => {
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
    it("as existing user", (done) => {
      const userData = {
        username: user1Username,
        password: user1Password
      };

      chai.request(server).post("/process-login").type("form").send(userData).end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.redirectTo(/\//);
        done();
      });
    });

    it("as nonexistent user", (done) => {
      const userData = {
        username: "irrelevant",
        password: "irrelevant"
      };

      chai.request(server).post("/process-login").type("form").send(userData).end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.redirectTo(/login\?errors=1/);
        done();
      });
    });

    it("as existing user with wrong password", (done) => {
      const userData = {
        username: user1Username,
        password: "irrelevant"
      };

      let startTime = new Date();

      chai.request(server).post("/process-login").type("form").send(userData).end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.redirectTo(/login\?errors=1/);
        expect(new Date() - startTime).to.be.greaterThan(999, "Expected delay of 1000 ms");
        done();
      });
    });
  });

  describe("Testing registration interface", () => {
    it("with valid information", (done) => {
      const userData = {
        username: "user3",
        password: "password3",
        email: "user3@test.com"
      };

      chai.request(server).post("/process-register").type("form").send(userData).end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.redirectTo(/\//);
        done();
      });
    });

    function expectsErr(username, password, email, expectsCode, done) {
      const userData = {
        username, password, email
      };

      chai.request(server).post("/process-register").type("form").send(userData).end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.redirectTo(new RegExp(`register\\?errors=${expectsCode}`));
        done();
      });
    }

    it("with existing username", (done) => { 
      expectsErr(user1Username, "irrelevant", "irrelevant@test.com", 512, done);
    });

    it("with existing email", (done) => {
      expectsErr("irrelevant", "irrelevant", user1Email, 1024, done);
    });
  });
});

describe("Testing student-related functions", () => {
  describe("Ensuring student integrity", () => {
    let testStudent;

    it("load from database", async () => {
      testStudent = await Student.loadById(student1.studentId);
    });

    it("#studentId", () => { expect(testStudent).to.have.property("studentId", student1.studentId); });
    it("#first", () => { expect(testStudent).to.have.property("first", student1.first); });
    it("#last", () => { expect(testStudent).to.have.property("last", student1.last); });
    it("#belt", () => { expect(testStudent).to.have.property("belt", student1.belt); });
    it("#rp", () => { expect(testStudent).to.have.property("rp", student1.rp); });
    it("#userId", () => { expect(testStudent).to.have.property("userId", student1.userId); });
  });

  describe("Load list of all students from database", () => {
    let studentList;

    it("should proceed without errors", async () => {
      studentList = await Student.loadAll(0, 10);
    });

    it("should have length of 2", () => { expect(studentList).to.have.lengthOf(2); });
 
    describe("Ensuring list is sorted by last name", () => {
      it(`should have ${student1Last} first`, () => { 
        expect(studentList[0]).to.have.property("last", student1Last);
       });
      it(`should have ${student2Last} last`, () => {
        expect(studentList[1]).to.have.property("last", student2Last);
       });
    });
  });

  describe("Load list of students by user", () => {
    let studentList;
  
    it("should proceed without errors", async () => {
      studentList = await Student.loadByUser(user1.userId);
    });

    it("should have length of 1", () => { expect(studentList).to.have.lengthOf(1); });
    it(`should only contain ${student1Last}`, () => { 
      expect(studentList[0]).to.have.property("last", student1Last);
    });
  });
});

describe("Testing event and attendance record", () => {
  describe("Ensure event integrity", () => {
    let testEvent;
  
    it("load from database", async () => {
      testEvent = await EventRecord.loadById(event1.eventId);
    });

    it("#eventId", () => { expect(testEvent).to.have.property("eventId", event1.eventId); });
    it("#eventName", () => { expect(testEvent).to.have.property("eventName", event1.eventName); });
    it("#pts", () => { expect(testEvent).to.have.property("pts", event1.pts); });
    it("#date", () => { expect(testEvent.date.toISOString()).to.equal(event1.date.toISOString()); });
    it("#description", () => { expect(testEvent).to.have.property("description", event1.description); });
  });

  it("Ensure attendance integrity", async () => {
    async function testAttendance(sid, eid, expected) {
      expect(await Attendance.getAttendance(sid, eid)).to.equal(expected);
    }

    await testAttendance(student1.studentId, event1.eventId, true);
    await testAttendance(student2.studentId, event1.eventId, true);
    await testAttendance(student1.studentId, event2.eventId, true);
    await testAttendance(student2.studentId, event2.eventId, false);
  });

  it("Ensure attendance list integrity", async () => {
    let list = await Attendance.getAttendanceList(event2.eventId);

    expect(Object.keys(list)).to.have.lengthOf(2);
    expect(list[student1.studentId]).to.equal(true);
    expect(list[student2.studentId]).to.equal(false);
  });

  describe("Testing total number of points", () => {
    let expectedUser1Pts;
    let expectedUser2Pts;   

    before(() => {
      expectedUser1Pts = student1.rp + event1Points + event2Points;
      expectedUser2Pts = student2.rp + event1Points;
    });

    it(`should return points for student1`, async () => {
      let pts = await Attendance.getUserPoints(student1.studentId);
      expect(pts).to.not.be.null;
      expect(pts).to.equal(expectedUser1Pts);
    });

    it(`should return points for student2`, async () => {
      let pts = await Attendance.getUserPoints(student2.studentId);
      expect(pts).to.not.be.null;
      expect(pts).to.equal(expectedUser2Pts);
    });
  });
});

describe("Load pages into a website simulator to test them", () => {
  let window;
  let document;

  async function setupPage(uri) {
    return new Promise((resolve) => {
      chai.request(server).get(uri).send().end((err, res) => {
        expect(err).to.be.null;
      
        window = (new JSDOM(res.text, {
          runScripts: "dangerously"
        })).window;
        document = window.document;

        expect(errorFake).to.have.property("callCount", 0);

        resolve();
      });
    });
  }

  it("#/", async () => { await setupPage("/"); });
  it("#/login", async () => { await setupPage("/login"); });
  it("#/register", async () => { await setupPage("/register"); });
  it("#/new-student", async () => { await setupPage("/new-student"); });
  it("#/new-event", async () => { await setupPage("/new-event"); });
  it("#/manage-students", async () => { await setupPage("/manage-students"); });
  it("#/change-rp", async () => { await setupPage("/change-rp"); });
});
