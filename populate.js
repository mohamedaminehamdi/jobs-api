require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./db/connect');
const Job = require('./models/Job');
const User = require('./models/User');
const mockJobs = require('./mock-data.json');

const DEMO_USER = {
  name: 'Demo',
  email: process.env.DEMO_USER_EMAIL || 'demo@example.com',
  password: process.env.DEMO_USER_PASSWORD || 'demo-password',
  isDemo: true,
};

const findUser = async (email) => {
  if (!email) {
    // no email given: seed the read-only demo account, creating it if needed
    return (await User.findOne({ email: DEMO_USER.email })) || User.create(DEMO_USER);
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error(`No user with email ${email}`);
  }
  return user;
};

// usage: npm run seed [-- <email>]
// replaces the jobs of the given user (or the demo user) with the mock data
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const user = await findUser(process.argv[2]);
    await Job.deleteMany({ createdBy: user._id });
    await Job.insertMany(mockJobs.map((job) => ({ ...job, createdBy: user._id })));
    console.log(`Seeded ${mockJobs.length} jobs for ${user.email}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

start();
