// db.js
// Minimal Neon (Postgres) database connection and schema setup for storing material assignments

const { Pool } = require("pg");

// Use environment variables for Neon connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Set this in your .env or deployment config
  ssl: { rejectUnauthorized: false },
});

// Create table if it doesn't exist
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS material_assignments (
      id SERIAL PRIMARY KEY,
      element_id VARCHAR(64) NOT NULL,
      element_type VARCHAR(64) NOT NULL,
      material_name VARCHAR(128) NOT NULL,
      urn VARCHAR(256),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

// Save or update a material assignment
async function saveMaterialAssignment({
  element_id,
  element_type,
  material_name,
  urn,
}) {
  await pool.query(
    `
    INSERT INTO material_assignments (element_id, element_type, material_name, urn, updated_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (element_id, urn)
    DO UPDATE SET material_name = EXCLUDED.material_name, element_type = EXCLUDED.element_type, updated_at = NOW();
  `,
    [element_id, element_type, material_name, urn]
  );
}

// Get all assignments for a model
async function getAssignmentsForUrn(urn) {
  const res = await pool.query(
    "SELECT * FROM material_assignments WHERE urn = $1",
    [urn]
  );
  return res.rows;
}

module.exports = {
  initDb,
  saveMaterialAssignment,
  getAssignmentsForUrn,
  pool,
};
