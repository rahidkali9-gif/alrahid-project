'use strict';

/**
 * Profile model — extended user profile (1:1).
 */
const db = require('../database');

const TABLE = 'profiles';

const Profile = {
  TABLE,

  async findByUserId(userId) {
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE user_id = $1`, [userId]);
    return r.rows[0] || null;
  },

  async upsert(userId, fields) {
    const allowed = [
      'first_name', 'last_name', 'phone', 'bio', 'address', 'city', 'country',
      'website', 'birth_date', 'gender', 'job_title', 'company', 'preferences', 'metadata',
    ];
    const cols = ['user_id'];
    const vals = [userId];
    const updates = ['user_id = EXCLUDED.user_id'];
    let idx = 2;
    for (const k of allowed) {
      if (fields[k] !== undefined) {
        cols.push(k);
        if ((k === 'preferences' || k === 'metadata') && typeof fields[k] === 'object') {
          vals.push(JSON.stringify(fields[k]));
        } else {
          vals.push(fields[k]);
        }
        updates.push(`${k} = EXCLUDED.${k}`);
        idx++;
      }
    }
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    const r = await db.query(
      `INSERT INTO ${TABLE} (${cols.join(', ')})
       VALUES (${placeholders})
       ON CONFLICT (user_id) DO UPDATE SET ${updates.join(', ')}
       RETURNING *`,
      vals
    );
    return r.rows[0];
  },

  async update(userId, fields) {
    return this.upsert(userId, fields);
  },
};

module.exports = Profile;
