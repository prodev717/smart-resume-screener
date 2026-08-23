import db from "../config/db.js";

const JobDescription = {
  async findAll() {
    const result = await db.query(
      "SELECT * FROM job_descriptions ORDER BY id DESC"
    );

    return result.rows;
  },

  async findById(id) {
    const result = await db.query(
      "SELECT * FROM job_descriptions WHERE id = $1",
      [id]
    );

    return result.rows[0];
  },

  async create(job_descriptions) {
    const result = await db.query(
      `INSERT INTO job_descriptions (job_description)
       VALUES ($1)
       RETURNING *`,
      [job_descriptions]
    );

    return result.rows[0];
  },

  async update(id, job_descriptions) {
    const result = await db.query(
      `UPDATE job_descriptions
       SET job_description = $1
       WHERE id = $2
       RETURNING *`,
      [job_descriptions, id]
    );

    return result.rows[0];
  },

  async delete(id) {
    const result = await db.query(
      `DELETE FROM job_descriptions
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return result.rows[0];
  },
};

export default JobDescription;