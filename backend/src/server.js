require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { sequelize } = require('./database/models');
const authRoutes = require('./routes/auth');
const claimRoutes = require('./routes/claims');
const policyRoutes = require('./routes/policies');
const documentRoutes = require('./routes/documents');
const { errorHandler } = require('./middleware/errorHandler');
const { initWorker } = require('./workers/validationWorker');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/documents', documentRoutes);

// Error handler
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Sync database (in production, use migrations)
    await sequelize.sync({ alter: true });
    console.log('✓ Database ready');

    // Initialize validation worker (no Redis needed)
    initWorker();

    app.listen(PORT, () => {
      console.log(`\n✓ Backend running on http://localhost:${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('✗ Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
