// BSD LICENSE - c John Nunley and Larson Rivera

import * as uuid from "uuid/v4";

import { Nullable } from "./../utils";
import { User } from "./index";

export interface Session {
  sessionId: string;
  user: User;
  expiry: Date;
};

// table of current user sessions
export class SessionTable {
  sessions: Array<Session>;

  constructor() {
    this.sessions = [];
  }

  // add a session to the table
  addSession(user: User, pushExpiry: boolean): string {
    let expiry = new Date();
    if (pushExpiry) {
      expiry.setDate(expiry.getDate() + 1);
    } else {
      expiry.setDate(expiry.getDate() + 7);
    }

    const session = {
      sessionId: uuid(),
      user: user,
      expiry: expiry 
    };

    this.sessions.push(session);
    return session.sessionId;
  }

  // check for invalidated sessions
  checkSessions() {
    const now = new Date();
    for (let i = this.sessions.length - 1; i >= 0; i--) {
      if (this.sessions[i].expiry <= now) {
        this.sessions.splice(i, 1);
      }
    }
  }

  checkSession(sessionId: string): Nullable<User> {
    this.checkSessions();
    for (let i = 0; i < this.sessions.length; i++) {
      if (this.sessions[i].sessionId === sessionId) return this.sessions[i].user;
    }
    return null;
  }
};
