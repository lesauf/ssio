const httpServer = require("./server").httpServer;

require('./terminal');

// server port
const port = process.env.PORT || 3000;

const startServer = () => {
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();