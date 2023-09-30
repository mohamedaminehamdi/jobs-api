const http = require('http');
const app = require('../app');

// supertest's default listen(0) binds to :: and on a busy machine can be handed a port
// that another process already holds on 127.0.0.1, so bind to loopback explicitly
const server = http.createServer(app).listen(0, '127.0.0.1');
afterAll(() => new Promise((resolve) => server.close(resolve)));

module.exports = server;
