import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const userInfo = { nickname, age, gender, location };

    if (!nickname || !age || !gender || !location) {
      alert("Please fill in all fields");
      return;
    }

    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    navigate("/chat");
  };

  return (
    <div className="login-page">
      <h1 className="login-title">Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Nickname:
            <input
              type="text"
              placeholder="Nick"
              className="form-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              minLength={3} // Minimum length
              maxLength={15} // Maximum length
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Age:
            <input
              type="number"
              className="form-input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="years old"
              required
              min={18} 
              max={120} 
            />
          </label>
        </div>

        <div className="form-group">
          <span>Gender:</span>
          <label>
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={gender === "Male"}
              onChange={(e) => setGender(e.target.value)}
              required 
            />{" "}
            Male
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={gender === "Female"}
              onChange={(e) => setGender(e.target.value)}
              required 
            />{" "}
            Female
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Other"
              checked={gender === "Other"}
              onChange={(e) => setGender(e.target.value)}
              required 
            />{" "}
            Other
          </label>
        </div>

        <div className="form-group">
          <label>
            Location:
            <input
              type="text"
              placeholder="Location"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              minLength={2} 
              maxLength={50} 
            />
          </label>
        </div>

        <button type="submit" className="submit-button">
          START
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
