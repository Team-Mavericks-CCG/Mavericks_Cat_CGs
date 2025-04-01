import React from "react";
import { useNavigate } from "react-router-dom";
import "./homePage.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h1>Homepage!</h1>
      <button onClick={() => navigate("/solitaire")}>Solitaire</button>
    </div>
  );
}

export default HomePage;
