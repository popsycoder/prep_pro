require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

connectDB();
configureCloudinary();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to VIDYA-NIKETAN CAREER ACADEMY API',
    version: '1.0.0',
    developer: 'Tvisha_Edutech.ai',
    institute: process.env.APP_NAME,
    locations: process.env.INSTITUTE_LOCATIONS,
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      tests: '/api/tests',
      payments: '/api/payments',
      profile: '/api/profile',
      content: '/api/content'
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/content', require('./routes/content'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🎓================================================');
  console.log(`   ${process.env.APP_NAME}`);
  console.log(`   Developer: ${process.env.DEVELOPER_NAME}`);
  console.log('================================================');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`📍 Locations: ${process.env.INSTITUTE_LOCATIONS}`);
  console.log('\n📚 API Endpoints:');
  console.log(`   ✅ Auth:     /api/auth`);
  console.log(`   ✅ Courses:  /api/courses`);
  console.log(`   ✅ Tests:    /api/tests`);
  console.log(`   ✅ Payments: /api/payments`);
  console.log(`   ✅ Profile:  /api/profile`);
  console.log(`   ✅ Content:  /api/content`);
  console.log('================================================\n');
});

process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});