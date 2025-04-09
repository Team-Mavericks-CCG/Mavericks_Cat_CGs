import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useColorScheme } from "@mui/material/styles";

const ColorModeToggle: React.FC = () => {
  const { mode, setMode } = useColorScheme();

  const handleToggleColorMode = () => {
    setMode(mode === "light" ? "dark" : "light");
  };

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      <IconButton
        onClick={handleToggleColorMode}
        color="primary"
        aria-label="toggle light/dark mode"
        sx={{
          width: 40,
          height: 40,
          padding: 1,
          mx: 2,
          transition: "transform 0.15s",
          "&:hover": {
            transform: "scale(1.05)",
            backgroundColor:
              mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ColorModeToggle;
