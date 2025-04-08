import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import SignIn from "./SignInComponent/SignIn";
import { SolitairePage } from "./games/solitaire/solitairePage";
import HomePage from "./homePage";
import Register from "./register/register";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />{" "}
        {/* / url is homepage but for now its the signin*/}
        <Route path="/home" element={<HomePage />} /> {/* homepage */}
        <Route path="/solitaire" element={<SolitairePage />} />{" "}
        {/* /solitaire url is solitaire*/}
        <Route path="/register" element={<Register />} />{" "}
        {/* /register url is sign up*/}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
