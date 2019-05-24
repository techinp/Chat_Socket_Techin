
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

// Socket.io

// Create variable
let users = {};
let name = [];

// Avoid error indexOf 
users.name = '';

io.on('connection', (socket) => {

    let username = {};

    // Every socket connection has a unique ID
    console.log('new connection: ' + socket.id);

    // Login
    socket.on('login', (data) => {

        username.nickname = data;

        // Keep all username in array
        socket.nickname = data;
        name.push(socket.nickname);
        users.name = name;
        console.log('name', name);

        socket.join('A Room');
        io.in('A Room').emit('login', {
            from: 'server',
            message: data + ' logged in.'
        });

        console.log('name :', users.name);

        updateUser(users.length, users.name);

    });

    // Recieve message from clients
    socket.on('msg', (message) => {
        // Send message to clients
        io.in('A Room').emit('msg', {
            from: username.nickname,
            message: message
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('socket.nickname :', socket.nickname);

        var index = users.name.indexOf(socket.nickname);

        console.log('index :', index);

        if (index >= 0) {
            users.name.splice(index, 1);
        }

        console.log('users.name :', users.name);

        console.log('users :', users);
        // delete socket.nickname;
        updateUser(users.length, users.name);
    });
});

function updateUser(list, name) {
    list = 0;
    io.in('A Room').clients((err, clients) => {
        if (err) throw err;
        console.log('clientsUpdate :', clients.length);
        console.log('clients :', clients);
        list = clients.length;
        io.in('A Room').emit('userOnline', {
            list: clients.length,
            name: name
        });
    });
}