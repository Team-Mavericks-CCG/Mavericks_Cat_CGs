import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import SignIn from "./SignInComponent/SignIn";
import { SolitairePage } from "./games/solitaire/solitairePage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SolitairePage />
  </StrictMode>
);
