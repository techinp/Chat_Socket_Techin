
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

io.on('connection', (socket) => {

    let username = {};
    // let name = [];

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

        // users.name.push(data);
        // users.name = data; ##
        // name.push(data);
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