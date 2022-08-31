require('./config/db');

const app = require('express')();
const { Server } = require('socket.io');
var http = require('http');
const cors = require('cors');
const bodyParser = require('express').json;

const routes = require('./routes');

// cors
var corsOptions = {
  origin: 'http://localhost:8080',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// for accepting post form data
app.use(bodyParser());

// registering routes
// app.use(routes);

// create HTTP server
var httpServer = http.createServer(app);

// bind the socket.io instance to the server:
var io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
      }
});

module.exports = {
  httpServer,
  io,
};
