# ChessBoard

A multiplayer chess game built with real-time communication using WebSockets and Socket.IO.

## Features

- Real-time synchronization of the chessboard between players
- Role-based assignment: White, Black, and Spectator
- Built using:
  - Node.js
  - Express.js
  - Socket.IO
  - EJS Templating

## How It Works

- The server assigns players roles based on availability
- Chess moves are synced live between clients using `socket.emit()` and `socket.on()`
- Spectators can view the game in real-time

