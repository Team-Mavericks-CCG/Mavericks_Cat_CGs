import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import SignIn from "./SignInComponent/SignIn";
import { SolitairePage } from "./games/solitaire/solitairePage";
import HomePage from "./homePage";
import Register from "./register/register";
import BlackjackWrapper from "./games/blackjack/blackjackWrapper";
import MainLayout from "./foundation-components/MainLayout";
import AuthLayout from "./foundation-components/AuthLayout";
import AppTheme from "./shared-theme/AppTheme";
import { CssBaseline } from "@mui/material";
import Profile from "./profile/profilePage";
import LobbyPage from "./lobby/lobbyPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppTheme>
      <CssBaseline enableColorScheme />
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

            {/* Games routes */}
            <Route path="/games">
              <Route path="solitaire" element={<SolitairePage />} />
              <Route path="blackjack" element={<BlackjackWrapper />} />
              {/* Add other game routes here */}
            </Route>
            <Route path="/profile" element={<Profile />} />
            {/* Add other routes that should have the TopBar */}\
            <Route path="/lobby" element={<LobbyPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppTheme>
  </StrictMode>
);
