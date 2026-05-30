const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

const db = new Database(path.join(dbPath, 'verlaine.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS economy (
    user_id TEXT PRIMARY KEY,
    balance INTEGER DEFAULT 0,
    bank INTEGER DEFAULT 0,
    work_cooldown INTEGER DEFAULT 0,
    daily_cooldown INTEGER DEFAULT 0,
    slut_cooldown INTEGER DEFAULT 0,
    rob_cooldown INTEGER DEFAULT 0,
    job TEXT DEFAULT NULL,
    inventory TEXT DEFAULT '{}',
    buildings TEXT DEFAULT '{}',
    has_wagon INTEGER DEFAULT 0,
    has_antirob INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_lost INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS quests (
    user_id TEXT,
    quest_id TEXT,
    progress INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, quest_id)
  );

  CREATE TABLE IF NOT EXISTS rp_profiles (
    user_id TEXT PRIMARY KEY,
    name TEXT DEFAULT NULL,
    age INTEGER DEFAULT 0,
    job TEXT DEFAULT NULL,
    description TEXT DEFAULT NULL,
    vehicle TEXT DEFAULT NULL,
    house TEXT DEFAULT NULL,
    money INTEGER DEFAULT 0,
    health INTEGER DEFAULT 100,
    hunger INTEGER DEFAULT 100,
    thirst INTEGER DEFAULT 100,
    wanted INTEGER DEFAULT 0,
    jail_until INTEGER DEFAULT 0,
    hospital_until INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS rp_vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    brand TEXT,
    model TEXT,
    price INTEGER,
    speed INTEGER,
    plate TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS rp_houses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    address TEXT,
    price INTEGER,
    rooms INTEGER
  );

  CREATE TABLE IF NOT EXISTS staff_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT,
    target_id TEXT,
    action TEXT,
    reason TEXT,
    duration INTEGER DEFAULT 0,
    timestamp INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    staff_id TEXT,
    reason TEXT,
    timestamp INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    user_id TEXT,
    staff_id TEXT,
    action TEXT,
    reason TEXT,
    duration INTEGER DEFAULT 0,
    timestamp INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT UNIQUE,
    user_id TEXT,
    category TEXT,
    status TEXT DEFAULT 'open',
    created_at INTEGER DEFAULT 0,
    closed_at INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS recruitment_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT UNIQUE,
    user_id TEXT,
    category TEXT,
    answers TEXT DEFAULT '{}',
    status TEXT DEFAULT 'open',
    created_at INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS mines (
    user_id TEXT PRIMARY KEY,
    charbon INTEGER DEFAULT 0,
    fer INTEGER DEFAULT 0,
    or INTEGER DEFAULT 0,
    diamant INTEGER DEFAULT 0,
    last_mine INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS boosts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    timestamp INTEGER DEFAULT 0
  );
`);

module.exports = {
  db,

  getEconomy(userId) {
    let row = db.prepare('SELECT * FROM economy WHERE user_id = ?').get(userId);
    if (!row) {
      db.prepare('INSERT INTO economy (user_id) VALUES (?)').run(userId);
      row = db.prepare('SELECT * FROM economy WHERE user_id = ?').get(userId);
    }
    return row;
  },

  setBalance(userId, amount) {
    this.getEconomy(userId);
    db.prepare('UPDATE economy SET balance = ? WHERE user_id = ?').run(Math.max(0, amount), userId);
  },

  addBalance(userId, amount) {
    const eco = this.getEconomy(userId);
    db.prepare('UPDATE economy SET balance = ?, total_earned = ? WHERE user_id = ?').run(
      Math.max(0, eco.balance + amount),
      amount > 0 ? eco.total_earned + amount : eco.total_earned,
      userId
    );
  },

  removeBalance(userId, amount) {
    const eco = this.getEconomy(userId);
    const newBal = Math.max(0, eco.balance - amount);
    db.prepare('UPDATE economy SET balance = ?, total_lost = ? WHERE user_id = ?').run(
      newBal,
      eco.total_lost + amount,
      userId
    );
    return newBal;
  },

  setCooldown(userId, type, time) {
    this.getEconomy(userId);
    db.prepare(`UPDATE economy SET ${type}_cooldown = ? WHERE user_id = ?`).run(time, userId);
  },

  getRpProfile(userId) {
    let row = db.prepare('SELECT * FROM rp_profiles WHERE user_id = ?').get(userId);
    if (!row) {
      db.prepare('INSERT INTO rp_profiles (user_id, created_at) VALUES (?, ?)').run(userId, Date.now());
      row = db.prepare('SELECT * FROM rp_profiles WHERE user_id = ?').get(userId);
    }
    return row;
  },

  updateRpProfile(userId, data) {
    this.getRpProfile(userId);
    const keys = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    db.prepare(`UPDATE rp_profiles SET ${keys} WHERE user_id = ?`).run(...values, userId);
  },

  addWarning(userId, staffId, reason) {
    db.prepare('INSERT INTO warnings (user_id, staff_id, reason, timestamp) VALUES (?, ?, ?, ?)').run(
      userId, staffId, reason, Date.now()
    );
  },

  getWarnings(userId) {
    return db.prepare('SELECT * FROM warnings WHERE user_id = ? ORDER BY timestamp DESC').all(userId);
  },

  addStaffLog(staffId, targetId, action, reason, duration = 0) {
    db.prepare('INSERT INTO staff_logs (staff_id, target_id, action, reason, duration, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(
      staffId, targetId, action, reason, duration, Date.now()
    );
  },

  getMines(userId) {
    let row = db.prepare('SELECT * FROM mines WHERE user_id = ?').get(userId);
    if (!row) {
      db.prepare('INSERT INTO mines (user_id) VALUES (?)').run(userId);
      row = db.prepare('SELECT * FROM mines WHERE user_id = ?').get(userId);
    }
    return row;
  },
};
