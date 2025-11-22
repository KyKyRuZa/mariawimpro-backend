const express = require('express');
const path = require('path');
const fs = require('fs');

const { helmetConfig, cors } = require('./config/security');
const { authLimiter, uploadLimiter, generalLimiter } = require('./config/rateLimit');
const logger = require('./config/logger');
const morganMiddleware = require('./middleware/morgan');
const errorHandler = require('./middleware/errorHandler');

const routes = require('./routes');

const app = express();

app.set('trust proxy', 1);
app.use(helmetConfig);
app.use(cors);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(morganMiddleware);


app.use('/api/auth', authLimiter);
app.use('/api/gallery', uploadLimiter);
app.use('/api', generalLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;