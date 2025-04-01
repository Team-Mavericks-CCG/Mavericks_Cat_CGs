import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import SignIn from "./SignInComponent/SignIn";
import { SolitairePage } from "./games/solitaire/solitairePage";
import HomePage from "./homePage";


createRoot(document.getElementById("root")!).render(
  <StrictMode> 
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />             {/* Sign-in */}
        <Route path="/home" element={<HomePage />} />           {/* homepage */}
        <Route path="/solitaire" element={<SolitairePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
