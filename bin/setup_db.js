#!/usr/bin/env node

// BSD license - c John Nunley and Larson Rivera

var config;
try {
  config = require('config.json');
} catch(_e) {
  config = require('../config.json');
}

var username = config.postgres_username;
var password = config.postgres_password;
var database = config.postgres_database;

console.log("CREATE USER " + username + " PASSWORD '" + password + "';");
console.log("CREATE DATABASE " + database + " OWNER = " + username + ";");
