const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = 8000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type'
}));

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }
});

const messages = [];
const users = [];
const chanels = [];

io.on('connection', (socket) => {

    // Emit previous messages to the newly connected client
    socket.emit('previous_messages', messages);
    
    // Emit the current list of active users
    socket.emit('active_users', users);

    // Emit the current list of channels
    socket.emit('chanels', chanels);

    // Handle setting a nickname for the user
    socket.on('setNickname', (nickname) => {
        socket.nickname = nickname;
        users.push(nickname);
        io.emit('active_users', users);
        
        const welcomeMessage = `${nickname} has joined the chat`;
        messages.push(welcomeMessage); 
        io.emit('message_welcome', welcomeMessage);
        console.log(`${nickname} connected`);

    });

    // Handle new nickname
    socket.on('modifyNickname', (newNickname) => {
        const oldNickname = socket.nickname;
        const userIndex = users.indexOf(oldNickname);

        if (userIndex !== -1) {
            users[userIndex] = newNickname;
        }

        socket.nickname = newNickname;
        io.emit('active_users', users); 

        const message = `${oldNickname} changed their nickname to ${newNickname}`;
        messages.push(message); 
        io.emit('message', message);
        console.log(`${oldNickname} changed their nickname to ${newNickname}`);
    });

    // Handle receiving a message
    socket.on('message', (message) => {
        if (socket.nickname) {
            const formattedMessage = `${socket.nickname}: ${message}`;
            messages.push(formattedMessage);
            io.emit('newNickname', formattedMessage);
            console.log(`${socket.nickname} sent message: ${message}`);
        }
    });

    // Handle creating a new channel
    socket.on('newChannel', (channel) => {
        if (socket.nickname) {
            chanels.push(channel);
            const message = `${socket.nickname} created channel: ${channel}`;
            messages.push(message); 
            io.emit('message', message);
            io.emit('chanels', chanels);
            console.log(`${socket.nickname} created channel: ${channel}`);
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        if (socket.nickname) {
            users.splice(users.indexOf(socket.nickname), 1);
            io.emit('active_users', users);
            
            const goodbyeMessage = `${socket.nickname} has left the chat`;
            messages.push(goodbyeMessage); 
            io.emit('message_goodbye', goodbyeMessage);
            console.log(`${socket.nickname} disconnected`);
        }
    });
});

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
