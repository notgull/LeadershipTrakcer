# LeadershipTrakcer [sic]

<p><a href="https://travis-ci.org/not-a-seagull/LeadershipTrakcer"><img src="https://travis-ci.org/not-a-seagull/LeadershipTrakcer.svg?branch=master" alt="Build Status" /></a> <a href='https://coveralls.io/github/not-a-seagull/LeadershipTrakcer?branch=master'><img src='https://coveralls.io/repos/github/not-a-seagull/LeadershipTrakcer/badge.svg?branch=master' alt='Coverage Status' /></a></p>

This is a project a friend and I are working on to build a student tracker for QJN Denice.

## Installation Instructions

You must have the `postgresql` database installed, as well as the `node` runtime. On a Linux-like operating system, these can be installed with the command:

```
# apt install node postgresql
```

On a Windows installation, they can be downloaded from these websites:

* [Postgres](https://www.postgresql.org/download/windows/) 
* [Node](https://nodejs.org/en/download/)

Then, clone the repository. This is done either with the following command:

```
git clone https://github.com/not-a-seagull/LeadershipTrakcer.git
```

or by downloading the `.zip` file from the [repository website](https://github.com/not-a-seagull/LeadershipTrakcer).

Then, you must run the `bin/setup_db.js` script in order to setup the Postgres database to use LeadershipTrakcer's schema. On a Linux-like operating system, you can run the command:

```
$ node bin/setup_db.js | sudo -u postgres psql
```

On Windows, open a Command Prompt window, `cd` to the installation directory and run the following command:

```
C:\Users\not-a-seagull\LeadershipTrakcer> PowerShell -Command "node bin/setup_db.js | sudo -u postgres psql"
```

Finally, build and run the repository. On Linux, this is done with:

```
$ npm run gulp
$ npm run server
```

On Windows, the same command can most likely be run within Powershell.

## Stuff to do:

- Crowns
- User id change
- Mobile support (login)
- Link navigation
- Buttons for multi-page
- Cool background (ask Mrs. Denice)
- Testing!!!!
- Delete student
