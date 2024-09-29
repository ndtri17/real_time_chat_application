import Sidebar from "../components /Sidebar.jsx";
import "../styles/HomePage.css";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const HomePage = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
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

    return () => {
      newSocket.close();
    };
  }, []);

  const handleSubmit = (e) => {
    if (e.key === "Enter" && message.trim() !== "") {
      e.preventDefault();
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div className="home-page">
      <Sidebar />
      <div className="content">
        <div className="messages">
        {messages.map((msg, index) => {
            const isWelcomeMessage = msg.includes("has joined the chat");
            const isGoodbyeMessage = msg.includes("has left the chat");
            
            return (
              <div
                key={index}
                className={`message ${isWelcomeMessage || isGoodbyeMessage ? "centered" : ""}`}
              >
                {msg}
              </div>
            );
          })}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleSubmit}
          placeholder="Type here!!!!"
        />
      </div>
    </div>
  );
};

export default HomePage;
