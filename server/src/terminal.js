const server = require('./server').io;
var os = require('os');
var pty = require('node-pty');
const { io } = require('./server');

var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

// When a new socket connects
io.on('connection', (socket) => {
  // Create terminal
  let ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    // cols: 81,
    // rows: 36,
    cwd: process.env.HOME,
    env: process.env,
  }); 
 
  socket.emit('data', "\r*** CONNECTION ESTABLISHED  ***\r\n");
  
  // Listen on the terminal for output and send it to the client
  ptyProcess.onData((data) => {
    socket.emit('data', data);
  });

  // Listen on the client and send any input to the terminal
  socket.on('input', (data) => {
    ptyProcess.write(data);
  });

  // When socket disconnects, destroy the terminal
  socket.on('disconnect', () => {
    ptyProcess.destroy();
  });
 
  /**
   * Adjust terminal size on backend
   * @see https://github.com/xtermjs/xterm.js/issues/1359#issuecomment-725099398
   */
  socket.on('resize', (cols, rows) => {
    ptyProcess.resize(cols, rows);
  });

  // Why this ?
  // ptyProcess.write('ls\r');
  // ptyProcess.resize(100, 40);
  // ptyProcess.write('ls\r');
});
