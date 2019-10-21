// this file will drop all of the tables if executed
// change this to "false" if this is ever run in a production environment. we shouldn't take the chance.
const should_tables_be_deleted = true;

if (!should_tables_be_deleted) {
  console.error("Nuh-uh");
  process.exit();
}

var sql = require('./../dist/backend/sql');

async function removeAll() {
  const query = `
    DROP TABLE Users CASCADE; DROP TABLE Students CASCADE;
  `;

  await sql.query(query, []);
}

if (require.main === module)
  removeAll().then(()=>{}).catch((e)=>{console.error("Error: " + e);});

exports.removeAll = removeAll;
