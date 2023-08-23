require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./db/connect');

const missing = ['MONGO_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const server = app.listen(port, () => console.log(`Server is listening on port ${port}...`));

    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down...`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
