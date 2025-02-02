const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);

const PORT = 3000;

// initiate socketio and attach with http server
const io = socketio(server);

app.use(express.static('public'));

const users = new Set();

io.on('connection', (socket) => {
    console.log('New user connected');

    // handle user when they will join the chat
    socket.on('join', (userName) => {
        users.add(userName);
        socket.userName = userName;
        // broadcast to all users that new user has joined
        io.emit('userJoined', userName);

        // send updated users list to all clients
        io.emit('usersList', Array.from(users));
    });

    // handle new message
    socket.on('chatMessage', (message) => {
        // broadcast message to all users
        io.emit('chatMessage', message);
    });

    // handle user disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected', socket.userName);
        users.forEach((user) => {
            if (user === socket.userName) {
                users.delete(user);
                // broadcast to all users that user has left
                io.emit('userLeft', user);
                // send updated users list to all clients
                io.emit('usersList', Array.from(users));
            }
        });

    });
});

server.listen(PORT, () => {
    console.log('Server started on http://localhost:3000');
}); 