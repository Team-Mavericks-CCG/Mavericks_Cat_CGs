import { Theme as MuiTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    vars?: {
      palette: MuiTheme['palette'];
      shape: MuiTheme['shape'];
      spacing: MuiTheme['spacing'];  
    };
  }
}