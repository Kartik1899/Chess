var mainBoard;
var mainGame;

window.onload = function () {
        initGame();
};

var socket = io();

window.onclick = function (e) {
    socket.emit('message', 'hello');
};

var initGame = function () {
    var cfg = {
        draggable: true,
        position: 'start',
        onDrop: handleMove,
    };

    mainBoard = new ChessBoard('mainFrame', cfg);
    mainGame = new Chess();
};


var handleMove = function (source, target) {
    var move = mainGame.move({ from: source, to: target });

    if (move === null) return 'snapback';
    else socket.emit("proper", move);
};

socket.on('proper', function (msg) {
    mainGame.move(msg);
    mainBoard.position(mainGame.fen());
})