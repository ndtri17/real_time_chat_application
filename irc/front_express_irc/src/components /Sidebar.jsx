import '../styles/Sidebar.css';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";

const Sidebar = () => {
    const [socket, setSocket] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [chanels, setChanel] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const newSocket = io("http://localhost:8000");
        setSocket(newSocket);

        newSocket.on("active_users", (data) => {
            setActiveUsers(data);
        });

        newSocket.on("chanels", (data) => {
            setChanel(data);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return ( 
        <div className="sidebar">
            <div className='general'>
                <h1>General</h1>
                <div className="sidebar-channel" onClick={() => navigate('/chat')}>
                    <p>#General Channel</p>
                </div>
            </div>

            <div className='other-channels'>
                <h1>Channels</h1>
                <div className="sidebar-channel">
                    {chanels.map((channel, index) => (
                        <div key={index}>
                            <p >#{channel}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className='user'> 
                <h1>Users online</h1>
                {activeUsers.map((user, index) => (
                    <div key={index} className="sidebar-channel">
                        <p>@{user}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Sidebar;
