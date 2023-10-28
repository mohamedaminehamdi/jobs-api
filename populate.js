require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./db/connect');
const Job = require('./models/Job');
const User = require('./models/User');
const mockJobs = require('./mock-data.json');

// usage: npm run seed -- <email>
// replaces the jobs of an existing user with the mock data
const start = async () => {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npm run seed -- <user email>');
    process.exit(1);
  }
  try {
    await connectDB(process.env.MONGO_URI);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error(`No user with email ${email}`);
    }
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
