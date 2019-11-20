/*
 * src/users/sessions.ts
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

  // remove a session
  removeSession(sessionId: string) {
    for (let i = 0; i < this.sessions.length; i++) {
      if (this.sessions[i].sessionId === sessionId) {
        this.sessions.splice(i, 1);
        return;
      }
    }
  }
};
