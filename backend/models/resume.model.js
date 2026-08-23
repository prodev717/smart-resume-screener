import db from "../config/db.js";

const Resume = {
  async findAll() {
    const result = await db.query(
      "SELECT * FROM resumes ORDER BY id DESC"
    );

    return result.rows;
  },

  async findById(id) {
    const result = await db.query(
      "SELECT * FROM resumes WHERE id = $1",
      [id]
    );

    return result.rows[0];
  },

  async create(resume) {
    const result = await db.query(
      `INSERT INTO resumes (resume)
       VALUES ($1)
       RETURNING *`,
      [resume]
    );

    return result.rows[0];
  },

  async update(id, resume) {
    const result = await db.query(
      `UPDATE resumes
       SET resume = $1
       WHERE id = $2
       RETURNING *`,
      [resume, id]
    );

    return result.rows[0];
  },

  async delete(id) {
    const result = await db.query(
      `DELETE FROM resumes
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return result.rows[0];
  },
};

export default Resume;