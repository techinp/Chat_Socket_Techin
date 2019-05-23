
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
// var userCount = 0;
// var onlineUser = {};
// onlineUser.count = 0;

// Socket.io
io.on('connection', (socket) => {

    let users = [];

    // Every socket connection has a unique ID
    console.log('new connection: ' + socket.id);

    // Login
    socket.on('login', (data) => {
        users.name = data;
        socket.join('A Room');
        io.in('A Room').emit('login', {
            from: 'server',
            message: data + ' logged in.'
        });

        updateUser(users.length);
        
    });

    // Recieve message from clients
    socket.on('msg', (message) => {
        // Send message to clients
        io.in('A Room').emit('msg', {
            from: users.name,
            message: message
        });
    });

    // io.emit('userOnline', {
    //     userList: users.length
    // });

    console.log('users.length :', users.length);

    // Disconnect
    socket.on('disconnect', () => {
        updateUser(users.length);
    });



    // User Logged in
    // socket.on('login', (name) => {
    //     // Map socket.id to the name
    //     users.id = socket.id;
    //     users.name = name;

    //     onlineUser.name = name;
    //     onlineUser.count = onlineUser.count + 1;
    //     socket.join('userBox');
    //     io.to('userBox').emit('userCount', {
    //         userCount: onlineUser.count
    //     });

    //     console.log('userCount :', onlineUser.count);    

    //     // Broadcast to everyone else (except the sender).
    //     // Say that the user has logged in.
    //     socket.broadcast.emit('msg', {
    //         from: 'server',
    //         message: `${name} logged in.`
    //     });
    // });

    // Message Recieved
    // socket.on('msg', (message) => {
    //     // Broadcast to everyone else (except the sender)
    //     socket.emit('msg', {
    //         from: users.name,
    //         message: message
    //     });
    //     // Send back the same message to the sender
    //     socket.emit('msg', {
    //         from: users.name,
    //         message: message
    //     });
    //     console.log('users :', users);
    // });

    // Disconnected
    // socket.on('disconnect', () => {
    //     onlineUser.count = onlineUser.count - 1;
    //     socket.join('userBox');
    //     io.to('userBox').emit('userCount', {
    //         userCount: onlineUser.count
    //     });
    //     console.log('userCount :', onlineUser.count);
    //     // Remove the socket.id -> name mapping of this user
    //     io.emit('disconnect', {
    //         from: users.name,
    //         message: users.name + ' has disconnect'
    //     });
    //     console.log('disconnect - ' + 'id :' + users.id + '/ name : ' + users.name);
    //     delete users.id;
    //     delete users.name;
    // });
});

function updateUser(list) {
    list = 0;
    io.in('A Room').clients((err, clients) => {
        if (err) throw err;
        console.log('clientsUpdate :', clients.length);
        console.log('clients :', clients);
        list = clients.length;
        io.in('A Room').emit('userOnline', {
            list: clients.length
        });
    });
}