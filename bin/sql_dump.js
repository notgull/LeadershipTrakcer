
var sql = require("./../dist/backend/sql");

async function dumpTable(tname) {
  const query = `SELECT * FROM ${tname};`;
  console.log(`=== ${tname} ===`);
  for (const row of query.rows) console.log(row);
}

(async () => {
  await dumpTable("Users");
  await dumpTable("Students");
  await dumpTable("Events");
  await dumpTable("Attendance");
})();
