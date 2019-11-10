// BSD LICENSE - c John Nunley and Larson Rivera

let chai = require("chai");
let { assert, expect } = chai;
chai.use(require("chai-http"));

let { getServer } = require("../dist/backend/server");
let { removeAll } = require("../bin/reset_db");
let { Student } = require("../dist/backend/student");
let { User } = require("../dist/backend/users");

// automated testing
describe("Automated Testing of LeadershipTrakcer", function() {
  let server;

  // clear the database before each run
  before(function(done) {
    // clear the database
    removeAll().then(() => {
      // re-initialize the server
      getServer().then((serv) => {
        server = serv;
        done();
      });
    }).catch((e) => {
      //console.log("Table delete failed, tables most likely do not exist yet");
      // re-initialize the server
      getServer().then((serv) => {
        server = serv;
        done();
      });
    });
  });

  // test to ensure that the user modules are working
  describe("Testing user systems", function() {
    let testUser;
    let user1;
    let user2;
    const user1Username = "user1";
    const user2Username = "user2";
    const user1Password = "password1";
    const user2Password = "password2";
    const user1Email = "user1@test.com";
    const user2Email = "user2@test.com";

    describe("Create User", function() {
      it("User creation should proceed without errors", function(done) {
        User.createNewUser(user1Username, user1Password, user1Email, false).then((user) => {
          user1 = user;
          done();
        });
      });


      it("User should exist", function() {
        assert(user1, "User does not exist");
      });
      it("Username should be identical to parameter", function() {
        expect(user1).to.have.property("username", user1Username, "Username does not match");
      });
      it("Email should be identical to parameter", function() {
        expect(user1).to.have.property("email", user1Email, "Email does not match");
      });
    });

    describe("Log into new user", function() {
      it("User load should proceed without errors", function(done) {
        User.loadByUsername(user1Username).then((user) => {
          testUser = user;
          done();
        });
      });

      it("User should exist", function() {
        assert(testUser, "User does not exist");
      });
      it("User's username should match original copy", function() {
        expect(testUser).to.have.property("username", user1Username, "Username does not match");
      });
      it("User's email should match original copy", function() {
        expect(testUser).to.have.property("email", user1Email, "Email does not match");
      });
      it("User's password hash should match one generated during creation", function() {
        expect(testUser).to.have.property("pwhash", user1.pwhash, "Password hashes do not match");
      });
    });
 
    // server-based tests
    // TODO: restore these when chai-http isn't broken
    describe("Create User via HTTP Interface", function() {
      it("User creation should proceed without errors", function(done) {
        const userData = {
          username: user2Username,
          password: user2Password,
          email: user2Email
        };
        chai.request(server).post("/process-register").type("form").send(userData).end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect; 
          done();
        });
      });

      describe("New user should be in database", function() {
        it("User load should proceed without errors", function(done) {
          User.loadByUsername(user2Username).then((user) => {
            testUser = user;
            done();
          });
        });

        it("User should exist", function() {
          assert(testUser, "User does not exist");
        });
        it("User's username should match original copy", function() {
          expect(testUser).to.have.property("username", user2Username, "Username does not match");
        });
        it("User's email should match original copy", function() {
          expect(testUser).to.have.property("email", user2Email, "Email does not match");
        });
      });
    });

    describe("Login via HTTP Interface", function() {
      let cookie; 

      it("User login should proceed without errors", function(done) {
        const userData = {
          username: user2Username,
          password: user2Password 
        };

        const agent = chai.request.agent(server);
        agent.post("/process-login").send(userData).end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirect;
          //console.log(res);
          expect(res).to.have.cookie("sessionId");
          agent.close();
          done();
        });
      });
    });

    describe("Register with existing username", function() {
      it("Creating a user to test with", function(done) {
        User.createNewUser(user1Username, user1Password, user1Email, false).then((_u) => {  
          done();
        });
      });
      it("Registration should redirect to /register?errors=512", function(done) {
        const userData = {
          username: user1Username,
          password: user1Password,
          email: "irrelevant@test.com"
        };
        chai.request(server).post("/process-register").send(userData).end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirectTo(/register\?errors=512/);
          done();
        });
      });
    });

    describe("Register with existing email", function() {
      it("Creating a user to test with", function(done) {
        User.createNewUser(user1Username, user1Password, user1Email, false).then((_u) => {
          done();
        });
      });

      it("Registration should redirect to /register?errors=1024", function(done) {
         const userData = {
          username: "irrelevant",
          password: user1Password,
          email: user1Email
        };
        chai.request(server).post("/process-register").send(userData).end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirectTo(/register\?errors=1024/);
          done();
        });
      });
    });

    describe("Login with incorrect password", function() {
      it("Creating a user to test with", function(done) {
        User.createNewUser(user1Username, user1Password, user1Email, false).then((_u) => {
          done();
        });
      });

      let beginDate;
      let endDate;

      it("Login should redirect to /login?errors=1", function(done) {
        const userData = {
          username: user1Username,
          password: "wrongPassword123"
        };
        beginDate = new Date();
        chai.request(server).post("/process-login").send(userData).end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirectTo(/login\?errors=1/);
          endDate = new Date();
          done();
        });
      });

      it("Invalid login should have a delay of at least 1000 milliseconds", function() {
        expect(endDate - beginDate).to.be.above(1000, "Delay was less than 1000 milliseconds");
      });
    });
  });

  let testUser;
  const tUsername = "user";
  const tEmail = "test@test.com";
  const tPassword = "irrelevant1";

  function createTestUser(done) {
    User.createNewUser(tUsername, tPassword, tEmail, false).then((user) => {
      testUser = user;
      done();
    });
  }

  function createAdminUser(done) {
    User.createNewUser(tUsername, tPassword, tEmail, true).then((user) => {
      testUser = user;
      done();
    });
  }

  // tests to ensure that the student modules are working
  describe("Testing student modules", function() {
    let student1;
    const student1First = "John";
    const student1Last = "Nunley";
    const student1Belt = "Black";
    const student1Rp = 600;
    it("Should be able to create student without errors", function() {
      student1 = new Student(student1First, student1Last, student1Belt, student1Rp);
    });

    let student2;
    const student2First = "Gray";
    const student2Last = "Smith";
    const student2Belt = "Red";
    const student2Rp = 10;
    student2 = new Student(student2First, student2Last, student2Belt, student2Rp);

    let testStudent;

    describe("Add, then retrieve student from database", function() {
      it("Students need to have an associated user to be added to the database", function(done) {
        createTestUser(done);
      });

      it("Add student to database", function(done) {
        student1.userId = testUser.userId;
        student1.submit().then(() => {
          done();
        });
      });

      it("Retrieval should proceed without errors", function(done) {
        Student.loadById(student1.studentId).then((student) => {
          testStudent = student;
          done();
        });
      });

      it("Student should exist", function() {
        expect(testStudent).to.not.be.null;
      });
   
      it("Student first and last names should match", function() {
        expect(testStudent).to.have.property("first", student1First, "First names do not match");
        expect(testStudent).to.have.property("last", student1Last, "Last names do not match");
      });
    });

    describe("Load several students from the database", function() {
      it("Students need to have an associated user to be added to the database", function(done) {
        createTestUser(done);
      });

      it("Add students to database", function(done) {
        student1.userId = testUser.userId;
        student2.userId = testUser.userId;
        student1.submit().then(() => {
          student2.submit().then(() => {
            done();
          });
        });
      });

      it("Retrieval should proceed without errors", function(done) {
        Student.loadAll(0, 10).then((students) => {
          testStudent = students;
          done();
        });
      });

      it("Student list should not be null", function() {
        expect(testStudent).to.not.be.null;
      });

      it("Student list should have a length of two", function() {
        expect(testStudent).to.have.lengthOf(2);
      });

      it("List should be sorted alphabetically by last name", function() {
        expect(testStudent[0]).to.have.property("last", "Nunley");
        expect(testStudent[1]).to.have.property("last", "Smith");
      });
    });
  });

  describe("Testing functionality of administration pages", function() {
    describe("Student Management Page", function() {
      it("Get administrator user", function(done) {
        createAdminUser(done);
      });
    });
  });

  let event1;
  const event1Title = "test placing";
  const event1Points = 10;
  const event1Date = new Date();

  function createEvent(done) {
    
  }

  describe("Testing events and attendance record", () => {
  

    
  });
});
