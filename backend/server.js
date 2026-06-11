const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

dotenv.config();
connectDB();

// Auto-create default admin on first run
const seedAdmin = async () => {
  try {
    const User = require('./models/User');
    const exists = await User.findOne({ role: 'admin' });
    if (!exists) {
      await User.create({
        name: 'Admin',
        email: 'admin@estimatrix.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('✅ Default admin created → email: admin@estimatrix.com | password: admin123');
    }
  } catch (e) {
    // DB not ready yet, skip
  }
};
setTimeout(seedAdmin, 3000); // wait for DB connection

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:5173', 'https://budget-prediction-app.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/historical', require('./routes/historicalRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/github', require('./routes/githubRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ESTIMATRIX API is running' }));

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ESTIMATRIX server running on port ${PORT}`));
