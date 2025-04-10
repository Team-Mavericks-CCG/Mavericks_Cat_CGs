import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
} from "@mui/material";
import {
  CardTheme,
  getCurrentTheme,
  setCardTheme,
  getAvailableThemes,
} from "../games/utils/CardImage";

interface CardThemeSelectorProps {
  onChange?: (theme: CardTheme) => void;
  compact?: boolean;
}

const CardThemeSelector: React.FC<CardThemeSelectorProps> = ({
  onChange,
  compact = false,
}) => {
  const [theme, setTheme] = React.useState<CardTheme>(getCurrentTheme());

  const handleChange = (event: SelectChangeEvent) => {
    const newTheme = event.target.value as CardTheme;
    setTheme(newTheme);
    setCardTheme(newTheme);

    if (onChange) {
      onChange(newTheme);
    }
  };

  const availableThemes = getAvailableThemes();

  // Format theme name for display
  const formatThemeName = (theme: string): string => {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  return (
    <Box
      sx={{
        minWidth: compact ? 100 : 120,
        mb: compact ? 0 : 2,
        mx: compact ? 1 : 0,
      }}
    >
      <FormControl fullWidth size="small">
        <InputLabel id="card-theme-select-label">Card Theme</InputLabel>
        <Select
          labelId="card-theme-select-label"
          id="card-theme-select"
          value={theme}
          label="Card Theme"
          onChange={handleChange}
        >
          {availableThemes.map((themeOption) => (
            <MenuItem key={themeOption} value={themeOption}>
              {formatThemeName(themeOption)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CardThemeSelector;
