const express = require('express');
const socket = require('socket.io');
const path = require('path');
const http = require('http');
const { Chess } = require('chess.js');
const { title } = require('process');
const app = express();
const server = http.createServer(app);
const io = socket(server); 

const chess = new Chess();
let players = {};
let currentPlayer = 'w';

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', {title: 'Chess Game'});
});

io.on('connection', (uniquesocket) => {
  console.log('A user connected:');

  if (!players.white) {
    players.white = uniquesocket.id;
    uniquesocket.emit('playerRole', 'w');
  }
  else if (!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit('playerRole', 'b');
  } else {
    uniquesocket.emit('spectatorRole');  
  }
  uniquesocket.on("disconnect", () => {
    if(uniquesocket.id === players.white) {
      delete players.white;
    }
    else if(uniquesocket.id === players.black) {
      delete players.black;
    }
  });  
  uniquesocket.on('move', (move) => {
    try{
      if(chess.turn() === 'w' && uniquesocket.id !== players.white) {
        return;
      } 
      if(chess.turn() === 'b' && uniquesocket.id !== players.black) {
        return;
      } 
      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        io.emit('move', move);
        io.emit('boardState', chess.fen());
      }
      else{
        console.log('Invalid move attempted:', move);
        uniquesocket.emit('invalidMove', move);
      }
    }
    catch(error){
      console.log(error);
      uniquesocket.emit('Invalid move : ', move)
    }
  })    
});
  
  

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});