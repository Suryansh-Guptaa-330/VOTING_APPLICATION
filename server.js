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
const app = express();
const db = require('./db');

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Import router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Mount routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
