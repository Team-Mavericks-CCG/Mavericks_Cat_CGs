import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import "./index.css";
import SignIn from "./SignInComponent/SignIn";
import { SolitairePage } from "./games/solitaire/solitairePage";
import HomePage from "./homePage";
import Register from "./register/register";
import BlackjackWrapper from "./games/blackjack/blackjackWrapper";
import MainLayout from "./foundation-components/MainLayout";
import AuthLayout from "./foundation-components/AuthLayout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CssVarsProvider defaultMode="system">
      <BrowserRouter>
        <Routes>
          {/* Auth routes without TopBar */}
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Main routes with TopBar */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/solitaire" element={<SolitairePage />} />
            <Route path="/blackjack" element={<BlackjackWrapper />} />
            {/* Add other routes that should have the TopBar */}
          </Route>
        </Routes>
      </BrowserRouter>
    </CssVarsProvider>
  </StrictMode>
);
