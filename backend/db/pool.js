const { Pool } = require('pg');

/**
 * Shared PostgreSQL connection pool.
 * Uses DATABASE_URL from environment variables.
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
    process.exit(-1);
});

module.exports = pool;
