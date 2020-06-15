var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var port = process.env.PORT || 3000;

var io = require('socket.io')(http);

io.on('connection', function(socket) {
    console.log('new user');

    socket.on('message', function(msg) {
        console.log('Client Says: ' + msg);
    });

    socket.on('proper', function(msg) {
        socket.broadcast.emit('proper', msg);
    });
});



app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

http.listen(port, function() {
    console.log('listening on : ' + port);
});