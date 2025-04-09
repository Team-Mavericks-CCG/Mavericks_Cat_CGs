import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import "./index.css";
import SignIn from "./SignInComponent/SignIn";
import { SolitairePage } from "./games/solitaire/solitairePage";
import HomePage from "./homePage";
import Register from "./register/register";
import TopBar from "./shared-theme/TopBar";
import BlackjackWrapper from "./games/blackjack/blackjackWrapper";

// Layout with TopBar
const MainLayout = () => {
  return (
    <>
      <TopBar />
      <Box
        component="main"
        sx={{
          pt: 8, // Add padding top equal to TopBar height
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <Outlet />
      </Box>
    </>
  );
};

// Auth layout without TopBar
const AuthLayout = () => {
  return <Outlet />;
};

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
