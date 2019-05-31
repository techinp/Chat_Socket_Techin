
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
let users = {};
let name = {};
let nameA = [];
let nameB = [];
let nameC = [];

// Avoid error indexOf 
name.nameA = '';
name.nameB = '';
name.nameC = '';


const url = 'mongodb://localhost:3000/';

// mongodb.connect(url, { useNewUrlParser: true }, (err, db) => {

// if(err){
//     throw err;
// }

// console.log("Connected successfully to server");

io.on('connection', (socket) => {

    // let chat = db.collection('chat');

    let username = {};
    let room;

    // Every socket connection has a unique ID
    console.log('new connection: ' + socket.id);

    // Login
    socket.on('login', (data) => {

        username.nickname = data.name;

        socket.nickname = data.name;

        console.log('name', name);

        if (data.room === '/A_Room') {
            console.log('Enter A Room');
            room = 'A Room';
            socket.join(room);

            // Keep all username in array
            nameA.push(socket.nickname);
            name.nameA = nameA;
            console.log('name.nameA :', name);

            io.in(room).emit('login', {
                from: 'server',
                message: data.name + ' logged in.'
            });

            updateUser(room, name.nameA.length, name.nameA);
        } else if (data.room === '/B_Room') {
            console.log('Enter B Room');
            room = 'B Room';
            socket.join(room);

            // Keep all username in array
            nameB.push(socket.nickname);
            name.nameB = nameB;

            io.in(room).emit('login', {
                from: 'server',
                message: data.name + ' logged in.'
            });

            updateUser(room, name.nameB.length, name.nameB);
        } else if (data.room === '/C_Room') {
            console.log('Enter C Room');
            room = 'C Room';
            socket.join(room);

            // Keep all username in array
            nameC.push(socket.nickname);
            name.nameC = nameC;

            io.in(room).emit('login', {
                from: 'server',
                message: data.name + ' logged in.'
            });

            updateUser(room, name.nameC.length, name.nameC);
        }

    });

    // Recieve message from clients
    socket.on('msg', (message) => {
        // Send message to clients

        // chat.insert( {name: message})
        io.in(room).emit('msg', {
            from: username.nickname,
            message: message
        });

        console.log('room :', room);
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('socket.nickname :', socket.nickname);

        io.in(room).emit('logout', {
            message: socket.nickname + ' has disconnect'
        });

        let indexA = name.nameA.indexOf(socket.nickname);
        let indexB = name.nameB.indexOf(socket.nickname);
        let indexC = name.nameC.indexOf(socket.nickname);

        if (room === 'A Room') {
            if (indexA >= 0) {
                name.nameA.splice(indexA, 1);
            }

            updateUser(room, name.nameA.length, name.nameA);
        } else if (room === 'B Room') {
            if (indexB >= 0) {
                name.nameB.splice(indexB, 1);
            }

            updateUser(room, name.nameB.length, name.nameB);
        } else if (room === 'C Room') {
            if (indexA >= 0) {
                name.nameC.splice(indexC, 1);
            }

            updateUser(room, name.nameC.length, name.nameC);
        }

        console.log('name.nameA :', name.nameA);
        console.log('name.nameB :', name.nameB);
        console.log('name.nameC :', name.nameC);
    });
});
// });

function updateUser(room, list, name) {
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