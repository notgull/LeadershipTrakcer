// BSD LICENSE - c John Nunley and Larson Rivera

let chai = require("chai");
let { assert, expect } = chai;
chai.use(require("chai-http"));

let { getServer } = require("../dist/backend/server");
let { removeAll } = require("../bin/reset_db");
let { User } = require("../dist/backend/users");

// automated testing
describe("Automated Testing of LeadershipTracker", function() {
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
        User.createNewUser(user1Username, user1Password, user1Email, null, false).then((user) => {
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
 
    /*// server-based tests
    describe("Create User via HTTP Interface", function() {
      it("User creation should proceed without errors", function(done) {
        const userData = {
          username: user2Username,
          password: user2Password,
          email: user1Email
        };
        chai.request(server).post("/process-register").type("form").send(userData).end((err, res) => {
          expect(res).to.redirect;
          expect(res).to.not.have.param("errors");
          done();
        });
      });
    });

    describe("Login via HTTP Interface", function() {
      it("User login should proceed without errors", function(done) {
        const userData = {
          username: user2Username,
          password: user2Password 
        };
        chai.request(server).post("/process-login").send(userData).end((err, res) => {
          expect(res).to.redirect;
          expect(res).to.not.have.param("error");
        });
      });
    });*/
  });
});
