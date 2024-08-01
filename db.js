const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR NOT NULL,
      age INT NOT NULL,
      address JSONB,
      additional_info JSONB
    );
  `;
  try {
    await db.query(query);
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

module.exports = { db, createTable };
