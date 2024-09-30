const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = 8000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST",
    allowedHeaders: "Content-Type",
  })
);

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

// Channel data structure
const channels = {
  General: {
    users: [],
    messages: [],
  },
};

io.on("connection", (socket) => {
  socket.currentChannel = "General";

  // Emit the current list of channels
  socket.emit("channels", Object.keys(channels));

  // Emit the active users in the General channel
  socket.emit("active_users", channels[socket.currentChannel].users);

  // Handle setting a nickname
  socket.on("setNickname", (nickname) => {
    socket.nickname = nickname;
    // Add user to the current channel
    channels[socket.currentChannel].users.push(nickname);
    socket.join(socket.currentChannel);
    
    // Emit active users and previous messages
    io.to(socket.currentChannel).emit("active_users", channels[socket.currentChannel].users);
    socket.emit("previous_messages", channels[socket.currentChannel].messages);

    const welcomeMessage = `${nickname} has joined the chat`;
    channels[socket.currentChannel].messages.push(welcomeMessage);
    io.to(socket.currentChannel).emit("message", welcomeMessage);

    console.log(`${nickname} connected`);
  });

  // Handle modifying a nickname
  socket.on("modifyNickname", (newNickname) => {
    const oldNickname = socket.nickname;
    const userIndex = channels[socket.currentChannel].users.indexOf(oldNickname);

    if (userIndex !== -1) {
      channels[socket.currentChannel].users[userIndex] = newNickname;
    }

    socket.nickname = newNickname;

    io.to(socket.currentChannel).emit("active_users", channels[socket.currentChannel].users);

    const message = `${oldNickname} changed their nickname to ${newNickname}`;
    channels[socket.currentChannel].messages.push(message);
    io.to(socket.currentChannel).emit("message", message);

    console.log(`${oldNickname} changed their nickname to ${newNickname}`);
  });

  // Handle receiving a message
  socket.on("message", (message) => {
    if (socket.nickname) {
      const formattedMessage = `${socket.nickname}: ${message}`;
      channels[socket.currentChannel].messages.push(formattedMessage);
      io.to(socket.currentChannel).emit("message", formattedMessage);

      console.log(`${socket.nickname} sent message: ${message}`);
    }
  });

  // Handle creating a new channel
  socket.on("newChannel", (channel) => {
    if (socket.nickname && !channels[channel]) {
      const message = `${socket.nickname} created channel: ${channel}`;

      channels[channel] = {
        users: [socket.nickname],
        messages: [message],
      };

      socket.leave(socket.currentChannel);
      socket.currentChannel = channel;
      socket.join(socket.currentChannel);

      io.emit("channels", Object.keys(channels));
      io.to(channel).emit("message", message);
      io.to(channel).emit("active_users", channels[channel].users);

      console.log(`${socket.nickname} created channel: ${channel}`);
    } else if (channels[channel]) {
      socket.emit("error", "Channel already exists");
    }
  });

  // Handle joining a channel
  socket.on("joinChannel", (channel) => {
    if (socket.nickname && channels[channel]) {
      socket.leave(socket.currentChannel);
      socket.currentChannel = channel;

      // Remove user from the current channel
      channels[socket.currentChannel].users = channels[socket.currentChannel].users.filter(
        (user) => user !== socket.nickname
      );

      io.to(socket.currentChannel).emit("active_users", channels[socket.currentChannel].users);

      socket.join(socket.currentChannel);

      if (!channels[channel].users.includes(socket.nickname)) {
        channels[channel].users.push(socket.nickname);
        const message = `${socket.nickname} joined channel: ${channel}`;
        channels[channel].messages.push(message);
        io.to(channel).emit("message", message);
      }

      io.to(channel).emit("active_users", channels[channel].users);
      socket.emit("previous_messages", channels[channel].messages);

      console.log(`${socket.nickname} joined channel: ${channel}`);
    } else {
      socket.emit("error", "Channel does not exist");
    }
  });

  // Handle leaving a channel
  socket.on("leaveChannel", () => {

    const currentChannel = socket.currentChannel;

    // Remove user from the current channel
    channels[currentChannel].users = channels[currentChannel].users.filter(
      (user) => user !== socket.nickname
    );

    io.to(currentChannel).emit("active_users", channels[currentChannel].users);

    const leaveMessage = `${socket.nickname} has left the channel: ${currentChannel}`;
    channels[currentChannel].messages.push(leaveMessage);
    io.to(currentChannel).emit("message", leaveMessage);

    // If leaving General, disconnect the user
    if (currentChannel === "General") {
      console.log(`${socket.nickname} logged out`);
      socket.emit("logout");
      socket.disconnect();
      return;
    }

    // Join back to the General channel
    socket.leave(currentChannel);
    socket.currentChannel = "General";
    socket.join(socket.currentChannel);

    // Add the user back to General
    channels.General.users.push(socket.nickname);
    io.to(socket.currentChannel).emit("active_users", channels.General.users);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    if (socket.nickname) {
      channels[socket.currentChannel].users = channels[socket.currentChannel].users.filter(
        (user) => user !== socket.nickname
      );

      io.to(socket.currentChannel).emit("active_users", channels[socket.currentChannel].users);

      const goodbyeMessage = `${socket.nickname} has left the chat`;
      channels[socket.currentChannel].messages.push(goodbyeMessage);
      io.to(socket.currentChannel).emit("message", goodbyeMessage);

      console.log(`${socket.nickname} disconnected`);
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
