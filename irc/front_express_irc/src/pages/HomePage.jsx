import Sidebar from "../components /Sidebar.jsx";
import "../styles/HomePage.css";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Picker from "emoji-picker-react";

const HomePage = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);

    if (userInfo) {
      newSocket.on("connect", () => {
        newSocket.emit("setNickname", userInfo.nickname);
      });
    }

    newSocket.on("previous_messages", (data) => {
      setMessages(data);
    });

    newSocket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("message_welcome", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("message_goodbye", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("newNickname", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("newChannel", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleSubmit = (e) => {
    if (e.key === "Enter" && message.trim() !== "") {
      e.preventDefault();

      if (!message.startsWith("/")) {
        socket.emit("message", message);
        setMessage("");
        return;
      }

      handleCommand(message);
      setMessage("");
    }
  };

  const handleCommand = (command) => {
    const parts = command.split(" ");
    const baseCommand = parts[0];
    const args = parts.slice(1);

    switch (baseCommand) {
      case "/nick":
        if (args.length < 1 || args[0].length < 3) {
          alert(
            "Usage: /nick <nickname> (nickname must be longer than 3 characters)"
          );
          return;
        }

        socket.emit("modifyNickname", args[0]);
        localStorage.setItem("userInfo", JSON.stringify({ nickname: args[0] }));
        break;

      case "/create":
        if (args.length < 1) {
          alert("Usage: /create <channel's name>");
          return;
        }

        socket.emit("newChannel", args[0]);
        break;

      case "/join":
        if (args.length < 1) {
          alert("Usage: /join <channel's name>");
          return;
        }

        socket.emit("joinChannel", args[0]);
        break;

      case "/leave":
        socket.emit("leaveChannel");
        break;

      default:
        alert("Unknown command");
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(message + emoji.emoji);
  };

  return (
    <div className="home-page">
      <Sidebar />
      <div className="content">
        <div className="messages">
          {messages.map((msg, index) => {
            const isWelcomeMessage = msg.includes("has joined the chat");
            const isGoodbyeMessage = msg.includes("has left the chat");
            const newNickname = msg.includes("changed their nickname to");
            const newChannel = msg.includes("created channel:");

            return (
              <div
                key={index}
                className={`message ${
                  isWelcomeMessage ||
                  isGoodbyeMessage ||
                  newNickname ||
                  newChannel
                    ? "centered"
                    : ""
                }`}
              >
                {msg}
              </div>
            );
          })}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleSubmit}
            placeholder="Type here!!!!"
          />
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            😊
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker">
              <Picker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
