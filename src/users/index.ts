// BSD LICENSE - c John Nunley and Larson Rivera

import { randomBytes as randomBytesCB } from "crypto";
import { promisify } from "util";

import { hashPassword } from "./validate";
import { query } from "./../sql";
import { Student } from "./../student";
import { Nullable, timeout } from "./../utils";

const randomBytes = promisify(randomBytesCB);

// structure defining the user
export class User {
  userId: number;
  username: string;
  email: string;
  pwhash: string;
  salt: Buffer;
  isAdmin: boolean;

  constructor(
    userId: number,
    username: string,
    email: string,
    pwhash: string,
    salt: Buffer,
    isAdmin: boolean,
  ) {

    this.userId = userId;
    this.username = username;
    this.email = email;
    this.pwhash = pwhash;
    this.salt = salt;
    this.isAdmin = isAdmin;
  }

  // validate a password
  async validate(password: string): Promise<boolean> {
    const tryhash = await hashPassword(password, this.salt); 
    if (tryhash === this.pwhash) {
      return true;
    } else {
      await timeout(1000); // a one-second on-wrong delay helps make the system secure against rainbow tables
      return false;
    }
  }

  // load a user object from a database row
  static fromRow(row: any): User {
    return new User(
      row.userid,
      row.username,
      row.email,
      row.pwhash,
      Buffer.from(JSON.parse(row.salt).data),
      row.isadmin
    );
  }

  // load a user by its ID
  static async loadById(userId: number): Promise<Nullable<User>> {
    const res = await query("SELECT * FROM Users WHERE userId=$1;", [userId]);
    if (res.rowCount === 0) return null; 
    else return User.fromRow(res.rows[0]); 
  }

  // load a user by its username
  static async loadByUsername(username: string): Promise<Nullable<User>> {
    const res = await query("SELECT * FROM Users WHERE username=$1;", [username]);
    if (res.rowCount === 0) return null;
    else return User.fromRow(res.rows[0]);
  }

  // create new user
  static async createNewUser(
    username: string, 
    password: string, 
    email: string,
    isAdmin: boolean): Promise<User> {

    // generate a random byte sequence
    const salt = await randomBytes(16);
    const pwhash = await hashPassword(password, salt);
    const stringifiedSalt = JSON.stringify(salt).split("'").join("\"");

    const addUserSql = `INSERT INTO Users (username, pwhash, email, salt, isAdmin) 
                        VALUES ($1, $2, $3, $4, $5) RETURNING userId;`;
    //console.log(`Adding user ${username} into database`);
    const res = await query(addUserSql, [username, pwhash, email, stringifiedSalt, isAdmin]);
    let user = new User(res.rows[0].userId, username, email, pwhash, salt, isAdmin);
    user.userId = res.rows[0].userid;
    return user;
  }

  // submit user details
  async submit(): Promise<void> {
    const updateSql = `UPDATE Users SET username=$1, pwhash=$2, email=$3, salt=$4, isAdmin=$5
                       WHERE userId=$7`;
    await query(updateSql, [this.username, this.pwhash, this.email, this.salt, this.isAdmin,
                            this.userId]);
  }
}
