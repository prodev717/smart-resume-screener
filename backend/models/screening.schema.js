import db from "../config/db.js";

const Screening = {
  async findAll({ resumeId, jdId } = {}) {
    let query = `
      SELECT *
      FROM screenings
    `;

    const values = [];
    const conditions = [];

    if (resumeId) {
      values.push(resumeId);
      conditions.push(`resume_id = $${values.length}`);
    }

    if (jdId) {
      values.push(jdId);
      conditions.push(`jd_id = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY id DESC";

    const result = await db.query(query, values);

    return result.rows;
  },

  async findById(id) {
    const result = await db.query(
      "SELECT * FROM screenings WHERE id = $1",
      [id]
    );

    return result.rows[0];
  },

  async create(resumeId, jdId, score, reason) {
    const result = await db.query(
      `INSERT INTO screenings (resume_id, jd_id, score, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [resumeId, jdId, score, reason]
    );

    return result.rows[0];
  },

  async update(id, score, reason) {
    const result = await db.query(
      `UPDATE screenings
       SET score = $1, reason = $2
       WHERE id = $3
       RETURNING *`,
      [score, reason, id]
    );

    return result.rows[0];
  },

  async delete(id) {
    const result = await db.query(
      `DELETE FROM screenings
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return result.rows[0];
  },
};

export default Screening;