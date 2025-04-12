import { Box } from "@mui/material";
import TopBar from "./TopBar"; // Adjust the import path as needed
import { Outlet } from "react-router-dom";

export function MainLayout() {
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
}

export default MainLayout;
