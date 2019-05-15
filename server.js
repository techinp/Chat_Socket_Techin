
const express = require('express');
const app = express();
// Socket.IO
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;
app.set('port', port);

// Start the server
http.listen(port, () => {
    console.log('Listening on port ' + port);
});

app.use('/', express.static('Public'));

app.get('/chatSocket', (req, res) => {
    res.sendFile(__dirname + '/chatSocket.html');
});

// let users = {};

// Socket.io
io.on('connection', (socket) => {

    // Every socket connection has a unique ID
    console.log('new connection: ' + socket.id);

    let users = {};

    // User Logged in
    socket.on('login', (name) => {
        // Map socket.id to the name
        users.id = socket.id;
        users.name = name;

        // Broadcast to everyone else (except the sender).
        // Say that the user has logged in.
        socket.broadcast.emit('msg', {
            from: 'server',
            message: `${name} logged in.`
        });
    });

    // Message Recieved
    socket.on('msg', (message) => {
        // Broadcast to everyone else (except the sender)
        socket.broadcast.emit('msg', {
            from: users.name,
            message: message
        });
        // Send back the same message to the sender
        socket.emit('msg', {
            from: users.name,
            message: message
        });
        console.log('users :', users);
    });

    // Disconnected
    socket.on('disconnect', function(){
        // Remove the socket.id -> name mapping of this user
        io.emit('disconnect', {
            from: users.name,
            message: users.name + ' has disconnect'
        });
        console.log('disconnect - ' + 'id :' + users.id + '/ name : ' + users.name);
        delete users.id;
        delete users.name;
    });
});