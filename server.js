// Suppress DEP0169 url.parse deprecation warning emitted by dependencies
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
    if (args[0] === 'DEP0169' || (typeof warning === 'string' && warning.includes('url.parse'))) {
        return;
    }
    if (typeof args[1] === 'string' && args[1] === 'DEP0169') {
        return;
    }
    return originalEmitWarning.call(process, warning, ...args);
};

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');

// Trust reverse proxy (required for Render, Vercel, and Cloudflare)
app.set('trust proxy', 1);

// List of explicitly allowed origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL // Configured in .env or Render dashboard
].filter(Boolean);

// CORS configuration for Vercel frontend and local development
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. mobile apps, Postman, curl, server-to-server)
        if (!origin) return callback(null, true);

        // Allow explicitly listed origins OR any Vercel domain (*.vercel.app)
        const isAllowed = allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin);

        if (isAllowed) {
            return callback(null, true);
        } else {
            return callback(new Error(`CORS blocked request from origin: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200 // Legacy browser support for OPTIONS preflight
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Root / Health check routes (essential for Render health checks and wake-up pings)
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'active',
        message: 'Voting App Backend API is running',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// Import router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Mount routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

// 404 Catch-All Route for undefined endpoints
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
