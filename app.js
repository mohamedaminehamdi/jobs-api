require('express-async-errors');

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const compression = require('compression');

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const app = express();

const authenticate = require('./middleware/authentication');
const { apiLimiter } = require('./middleware/rate-limit');

//routers
const jobsRouter = require('./routes/jobs');
const authRouter = require('./routes/auth');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}
app.use(express.json({ limit: '10kb' }));
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*' }));
app.use(xss());
app.use(mongoSanitize());
app.use(compression());

app.get('/', (req, res) => {
  res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
});
app.get('/api/v1/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'degraded',
    uptime: Math.round(process.uptime()),
    database: connected ? 'connected' : 'disconnected',
  });
});

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.set('trust proxy', 1);
app.use(apiLimiter);

// routes
app.use('/api/v1/jobs', authenticate, jobsRouter);
app.use('/api/v1/auth', authRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
