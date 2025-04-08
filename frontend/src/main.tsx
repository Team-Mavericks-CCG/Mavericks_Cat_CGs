import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import SignIn from "./SignInComponent/SignIn";
import { SolitairePage } from "./games/solitaire/solitairePage";
import Leaderboard from "./leaderboard/leaderboardpage"; 
import EndOGamePageLeaderboard from "./leaderboard/endOGamePage"; 

createRoot(document.getElementById("root")!).render(
  <StrictMode> 
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<SignIn />} />  {/* / url is homepage but for now its the signin*/} 
        <Route path="/solitaire" element={<SolitairePage />} /> {/* /solitaire url is solitaire*/} 
        <Route path="/Leaderboard" element={<Leaderboard />} /> {/* /Leaderboard url is leaderboard*/}
        <Route path="/EndOGamePageLeaderboard" element={<EndOGamePageLeaderboard />} /> {/* /Leaderboard url is leaderboard*/}
      </Routes>
    </BrowserRouter>

  </StrictMode>
);
