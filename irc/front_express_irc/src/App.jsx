import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ChannelPage from './pages/ChanelPage.jsx';
import "../src/styles/App.css";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/chat" element={<HomePage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
