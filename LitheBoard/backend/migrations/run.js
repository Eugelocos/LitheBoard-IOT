// Usage: node migrations/run.js --apply --backup /absolute/path/to/dump.sql
const fs = require('fs');
async function main() {
  const args = process.argv.slice(2);
  const backup = args[args.indexOf('--backup') + 1];
  if (!args.includes('--apply') || !args.includes('--backup') || !backup || fs.statSync(backup).size === 0) throw new Error('Stop application writers and supply --apply --backup <nonempty SQL dump>');
  const db = require('../config/db');
  const connection = await db.getConnection();
  try { console.log(JSON.stringify(await require('./005_canonical_contracts').migrate(connection))); }
  finally { connection.release(); await db.end(); }
}
if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
