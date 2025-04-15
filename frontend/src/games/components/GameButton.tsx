import { Button, styled } from "@mui/material";

export const GameButton = styled(Button)(() => ({
  backgroundColor: "rgba(20, 20, 20, 0.8)",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
  transition: "all 0.2s ease",
  textAlign: "center",
  fontWeight: "bold",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
  "&:hover": {
    backgroundColor: "rgba(20, 20, 20, 0.6)",
    transform: "translateY(-2px)",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.2)",
  },
  "&.Mui-disabled": {
    backgroundColor: "rgba(20, 20, 20, 0.4)",
    color: "rgba(255, 255, 255, 0.5)",
  },
}));
