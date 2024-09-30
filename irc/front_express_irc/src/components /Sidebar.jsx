import "../styles/Sidebar.css";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const Sidebar = () => {
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [chanels, setChannel] = useState([]);

  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);

    newSocket.on("active_users", (data) => {
      setActiveUsers(data);
    });

    newSocket.on("channels", (data) => {
      setChannel(data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="sidebar">
      <div className="other-channels">
        <h1>Channels</h1>
        {chanels.map((channel, index) => (
          <div className="sidebar-channel">
            <div key={index}>
              <p>#{channel}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="user">
        <h1>Users online</h1>
        {activeUsers.map((user, index) => (
          <div key={index} className="sidebar-channel">
            <p>@{user}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
