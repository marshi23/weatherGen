let express = require('express');
let app = express();


let server = app.listen(3000);
app.use(express.static('public'));

let socket = require('socket.io');
let io = socket(server);
console.log('my server is running');

io.sockets.on('connection', newConnection);

function newConnection(socket) {
  console.log('new connection: ' + socket.id);

  socket.on('mouse', mouseMsg);

  function mouseMsg(data) {
    socket.broadcast.emit('mouse', data);
    console.log(data);
  }
}
