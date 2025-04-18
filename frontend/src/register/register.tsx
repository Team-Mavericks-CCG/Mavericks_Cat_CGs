import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ColorModeToggle from "../shared-theme/ColorModeToggle";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../utils/api";
import { AxiosError } from "axios";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  minHeight: "75%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "650px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function Register() {
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfrimPasswordErrorMessage] =
    React.useState("");

  const validateUsername = (): boolean => {
    const username = document.getElementById("username") as HTMLInputElement;

    if (!username.value || username.value.length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage("Username must be at least 3 characters long.");
      return false;
    }
    setUsernameError(false);
    setUsernameErrorMessage("");

    return true;
  };

  const validatePassword = (): boolean => {
    const password = document.getElementById("password") as HTMLInputElement;

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      return false;
    }
    setPasswordError(false);
    setPasswordErrorMessage("");

    return true;
  };

  const samePassword = (): boolean => {
    const password = document.getElementById("password") as HTMLInputElement;
    const confirmPassword = document.getElementById(
      "confirmPassword"
    ) as HTMLInputElement;

    if (confirmPassword.value != password.value) {
      setConfirmPasswordError(true);
      setConfrimPasswordErrorMessage("Passwords must be the same");
      return false;
    }
    setConfirmPasswordError(false);
    setConfrimPasswordErrorMessage("");

    return true;
  };

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (usernameError || passwordError || confirmPasswordError) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const username = data.get("username") as string;
    const password = data.get("password") as string;

    try {
      const response = await AuthAPI.register(username, password);

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("username", username);

      /*window.location.href = "/solitaire";  full page reload, rm */
      void navigate("/"); /* routes to the home page*/
    } catch (error) {
      console.error("Error during register:", error);

      // Show error to user
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
          setUsernameError(true);
          setUsernameErrorMessage("Username taken. Please choose another one.");
        } else {
          alert("Register failed. Please try again later.");
        }
      } else {
        alert("Network error. Please check your connection.");
      }
    }
  };

  return (
    <SignUpContainer direction="column" justifyContent="space-between">
      <Box sx={{ position: "fixed", top: "1rem", right: "1rem" }}>
        <ColorModeToggle />
      </Box>
      <Card variant="outlined">
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          Register
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FormControl sx={{ height: "90px", mb: 1 }}>
            <FormLabel htmlFor="username">Username</FormLabel>
            <TextField
              error={usernameError}
              helperText={usernameErrorMessage}
              id="username"
              type="text"
              name="username"
              placeholder="username"
              autoComplete="username"
              autoFocus
              required
              fullWidth
              variant="outlined"
              onChange={validateUsername}
              color={usernameError ? "error" : "primary"}
              sx={{
                "& .MuiFormHelperText-root": {
                  minHeight: "20px",
                  margin: "3px 14px 0",
                },
              }}
            />
          </FormControl>
          <FormControl sx={{ height: "90px", mb: 1 }}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              onChange={validatePassword}
              color={passwordError ? "error" : "primary"}
              sx={{
                "& .MuiFormHelperText-root": {
                  minHeight: "20px",
                  margin: "3px 14px 0",
                },
              }}
            />
          </FormControl>
          <FormControl sx={{ height: "90px", mb: 1 }}>
            <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
            <TextField
              error={confirmPasswordError}
              helperText={confirmPasswordErrorMessage}
              name="confirmPassword"
              placeholder="••••••"
              type="password"
              id="confirmPassword"
              autoComplete="current-password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              onChange={samePassword}
              color={passwordError ? "error" : "primary"}
              sx={{
                "& .MuiFormHelperText-root": {
                  minHeight: "20px",
                  margin: "3px 14px 0",
                },
              }}
            />
          </FormControl>

          <Button type="submit" fullWidth variant="contained">
            Sign up
          </Button>
        </Box>
        <Divider>
          <Typography sx={{ color: "text.secondary" }}>or</Typography>
        </Divider>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ textAlign: "center" }}>
            Already have an account?{" "}
            <Link href="./signin" variant="body2" sx={{ alignSelf: "center" }}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </Card>
    </SignUpContainer>
  );
}
