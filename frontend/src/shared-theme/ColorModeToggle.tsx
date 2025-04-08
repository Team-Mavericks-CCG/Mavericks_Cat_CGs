import React from "react";
import { Switch, SxProps, Theme, Box } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark mode icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light mode icon
import { useColorScheme } from "@mui/material/styles";

interface ThemeToggleProps {
  sx?: SxProps<Theme>;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ sx }) => {
  const { mode, setMode } = useColorScheme();
  const isDarkMode = mode === "dark";

  return (
    <Box sx={{ display: "flex", alignItems: "center", ...sx }}>
      <Brightness7Icon
        sx={{ mr: 1, color: isDarkMode ? "text.disabled" : "primary.main" }}
      />
      <Switch
        checked={isDarkMode}
        onChange={(_, checked) => setMode(checked ? "dark" : "light")}
        color="primary"
        inputProps={{ "aria-label": "theme toggle switch" }}
      />
      <Brightness4Icon
        sx={{ ml: 1, color: isDarkMode ? "primary.main" : "text.disabled" }}
      />
    </Box>
  );
};

export default ThemeToggle;
