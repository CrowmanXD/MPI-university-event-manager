const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRouter    = require('./routes/auth');
const eventsRouter  = require('./routes/events');
const errorHandler  = require('./middleware/errorHandler');

const app  = express();
const port = process.env.PORT || 8080;

// ── Global middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', message: 'Backend is running!' });
});

app.use('/api/auth',   authRouter);
app.use('/api/events', eventsRouter);

// ── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});