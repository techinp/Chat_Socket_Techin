
const mongodb = require('mongodb').MongoClient;
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

const express = require('express');
const app = express();
// Socket.IO
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;
app.set('port', port);

let rooms = ['A_Room', 'B_Room', 'C_Room'];

// Start the server
http.listen(port, () => {
    console.log('Listening on port ' + port);
});

app.use('/', express.static('Public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Lobby.html');
});

for (let i = 0; i < rooms.length; i++) {
    app.get('/' + rooms[i], (req, res) => {
        res.sendFile(__dirname + '/chatSocket.html');
    });
}

// Socket.io

// Create variable
let name = {
    roomA: [],
    roomB: [],
    roomC: []
};

const url = 'mongodb://localhost:3000/';

io.on('connection', (socket) => {

    // let chat = db.collection('chat');
    
    let room;

    // Every socket connection has a unique ID
    console.log('new connection: ' + socket.id);

    // Login
    socket.on('login', (data) => {

        // username.nickname = data.name;
        socket.nickname = data.name;

        console.log('name', name);

        if (data.room === '/A_Room') {

            console.log('Enter A Room');
            room = 'A Room';
            socket.join(room);

            // Keep all username in array
            name.roomA.push({
                name: socket.nickname,
                id: data.userid
            });

            io.in(room).emit('login', {
                from: 'server',
                message: data.name + ' logged in.'
            });

            updateUserInRoom(room, name.roomA.length, name.roomA);
        } else if (data.room === '/B_Room') {

            console.log('Enter B Room');
            room = 'B Room';
            socket.join(room);

            // Keep all username in array
            name.roomB.push({
                name: socket.nickname,
                id: data.userid
            });

            io.in(room).emit('login', {
                from: 'server',
                message: data.name + ' logged in.'
            });

            updateUserInRoom(room, name.roomB.length, name.roomB);
        } else if (data.room === '/C_Room') {

            console.log('Enter C Room');
            room = 'C Room';
            socket.join(room);

            // Keep all username in array
            name.roomC.push({
                name: socket.nickname,
                id: data.userid
            });


            io.in(room).emit('login', {
                from: 'server',
                message: data.name + ' logged in.'
            });

            updateUserInRoom(room, name.roomC.length, name.roomC);
        }
    });

    // Recieve message from clients
    socket.on('msg', (message) => {
        // Send message to clients

        // chat.insert( {name: message})
        io.in(room).emit('msg', {
            from: socket.nickname,
            message: message,
            userid: socket.id
        });

    });

    // Disconnect
    socket.on('disconnect', () => {

        io.in(room).emit('logout', {
            message: socket.nickname + ' has disconnect'
        });

        if (room === 'A Room') {

            deleteUser(name.roomA, socket.id);
            updateUserInRoom(room, name.roomA.length, name.roomA);

        } else if (room === 'B Room') {

            deleteUser(name.roomB, socket.id);
            updateUserInRoom(room, name.roomB.length, name.roomB);

        } else if (room === 'C Room') {
            
            deleteUser(name.roomC, socket.id);
            updateUserInRoom(room, name.roomC.length, name.roomC);
        }

    });
});
// });

function deleteUser(array, socketID) {

    for (let i = 0; i < array.length; i++) {
        const value = array[i];
        if (value.id === socketID) {
            array.splice(i, 1);
        }
    }
}

function updateUserInRoom(room, list, name) {
    list = 0;
    io.in(room).clients((err, clients) => {
        if (err) throw err;
        console.log('clientsUpdate :', clients.length);
        list = clients.length;

        io.in(room).emit('userOnline', {
            list: clients.length,
            name: name
        });
    });
}