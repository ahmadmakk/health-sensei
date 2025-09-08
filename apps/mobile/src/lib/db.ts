import * as SQLite from 'expo-sqlite';

const DB_NAME = 'healthai.db';
const db = SQLite.openDatabase(DB_NAME);

function execSqlAsync(sql: string, args: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(sql, args, (_, result) => resolve(result), (_, error) => { reject(error); return false; });
    });
  });
}

export async function initDb() {
  await execSqlAsync(`PRAGMA foreign_keys = ON;`);
  await execSqlAsync(`CREATE TABLE IF NOT EXISTS meals (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    items TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );`);

  await execSqlAsync(`CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY,
    json TEXT NOT NULL
  );`);

  // prune old meals (>3 days)
  await execSqlAsync(`DELETE FROM meals WHERE date < date('now','-3 day');`);
}

export async function runSql(sql: string, args: any[] = []) {
  return execSqlAsync(sql, args);
}

export default { db, initDb, runSql };
