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

io.on('connection', (socket) => {
    
    // Emit previous messages to the newly connected client
    socket.emit('previous_messages', messages);
    
    // Emit the current list of active users
    socket.emit('active_users', users);

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

    // Handle receiving a message
    socket.on('message', (message) => {
        if (socket.nickname) {
            const formattedMessage = `${socket.nickname}: ${message}`;
            messages.push(formattedMessage);
            io.emit('message', formattedMessage);
            console.log(`${socket.nickname} sent message: ${message}`);
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
