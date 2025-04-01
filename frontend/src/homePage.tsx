import React from "react";
import { useNavigate } from "react-router-dom";
import "./homePage.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h1>Homepage!</h1>
      <div>
        <button onClick={() => void navigate("/solitaire")}>Solitaire</button>
      </div>
    </div>
  );
}

export default HomePage;
