const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Force IPv4 resolution to prevent IPv6 TLS drops from Atlas
dns.setDefaultResultOrder('ipv4first');

// Use Google Public DNS to prevent querySrv issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Use Atlas URL if available, otherwise fall back to local MongoDB
const mongoURL = process.env.MONGODB_URL || process.env.MONGODB_URL_LOCAL;

if (!mongoURL) {
    console.error('Error: Neither MONGODB_URL nor MONGODB_URL_LOCAL is defined in .env file.');
}

// Connect to MongoDB
mongoose.connect(mongoURL)
    .catch((err) => {
        console.error('Initial MongoDB connection error:', err.message);
    });

const db = mongoose.connection;

// Event listeners for database connection
db.on('connected', () => {
    console.log('Connected to MongoDB server');
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

module.exports = db;
