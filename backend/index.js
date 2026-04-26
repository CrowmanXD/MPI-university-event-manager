const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});