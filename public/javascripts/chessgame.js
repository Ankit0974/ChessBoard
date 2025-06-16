const socket = io();
const chess = new Chess();
const boardElement = document.querySelector('.chessboard');

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  
  if (playerRole === 'b') {
    boardElement.classList.add('flipped-board');
  } else {
    boardElement.classList.remove('flipped-board');
  }
  const board = chess.board();
  boardElement.innerHTML = '';
  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement('div');
      squareElement.classList.add('square');
      squareElement.classList.add((rowIndex + squareIndex) % 2 === 0 ? 'light' : 'dark');
      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squareIndex;

      
      if (square) {
        const pieceElement = document.createElement('div');
        pieceElement.classList.add('piece');
        pieceElement.innerText = getPieceUnicode(square);

        
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener('dragstart', (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowIndex, col: squareIndex };
            e.dataTransfer.setData('text/plain', '');
          }
        });

        pieceElement.addEventListener('dragend', (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedPiece && sourceSquare) {
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col)
          };
          handleMove(sourceSquare, targetSquare);
        }
      });

      boardElement.appendChild(squareElement);
//       if (square) {
//   const pieceElement = document.createElement('div');
//   pieceElement.classList.add('piece');
//   pieceElement.innerText = getPieceUnicode(square);

//   // Flip black pieces
//   if (square.color === 'b') {
//     pieceElement.classList.add('flipped');
//   }

//   // Only allow dragging if it's the player's piece
//   pieceElement.draggable = playerRole === square.color;

//   // ...existing code...
// }
    });
  });
  
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: 'q',
  };
  
  const result = chess.move(move);
  if (result) {
    renderBoard();
    socket.emit('move', move);
  }
};

// ...

socket.on('move', function (data) {
  chess.move(data);
  renderBoard();
});

const getPieceUnicode = (piece) => {
  const unicodePieces = {
    p: '♟',
    r: '♜',
    n: '♞',
    b: '♝',
    q: '♛',
    k: '♚',
    P: '♙',
    R: '♖',
    N: '♘',
    B: '♗',
    Q: '♕',
    K: '♔'
  };
  
  if (!piece) return '';
  const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
  return unicodePieces[key] || '';
};

socket.on('playerRole', function (role) {
  playerRole = role; 
  renderBoard();
});

socket.on('spectatorRole', function () {
  playerRole = null;
  renderBoard();
});

socket.on('boardState', function (fen) {
  chess.load(fen);
  renderBoard();
});

// socket.on('move', function (data) {
//   chess.move(move);
//   renderBoard();
// });

renderBoard();