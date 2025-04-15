import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import FormLabel from "@mui/material/FormLabel";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import AppTheme from "../shared-theme/AppTheme";
import ColorModeSelect from "../shared-theme/ColorModeSelect";
import { AuthAPI } from "../utils/api";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { FormControl } from "@mui/material";

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

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "center",
  },
}));

interface UserData {
  username: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
  avatarUrl: string;
  joinDate: string;
}

export default function ProfilePage(props: {
  disableCustomTheme?: boolean;
}): React.JSX.Element {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);
  const [userData, setUserData] = React.useState<UserData>({
    username: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    avatarUrl: "",
    joinDate: "",
  });
  const [editData, setEditData] = React.useState(userData);
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    React.useState("");

  React.useEffect(() => {
    console.log(localStorage.getItem("authToken"));
    const token = localStorage.getItem("authToken");
    if (token === null) {
      void navigate("/signin");
      return;
    }

    // Verify token and get user data
    AuthAPI.getProfile()
      .then((response) => {
        const data = response.data;
        setUserData({
          ...userData,
          username: data.user.username,
          joinDate: `Joined ${new Date(data.user.createdAt).toLocaleDateString()}`,
        });
        setEditData({
          ...editData,
          username: data.user.username,
        });
      })
      .catch((e) => {
        console.error("Error fetching user data", e);
        void navigate("/signin");
      });
  }, [navigate]);

  const validatePassword = (value: string): boolean => {
    if (!value || value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      return false;
    }
    setPasswordError(false);
    setPasswordErrorMessage("");
    return true;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ): boolean => {
    if (confirmPassword !== password) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage("Passwords must be the same");
      return false;
    }
    setConfirmPasswordError(false);
    setConfirmPasswordErrorMessage("");
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !validatePassword(editData.password) ||
      !validatePassword(editData.newPassword) ||
      !validateConfirmPassword(editData.newPassword, editData.confirmPassword)
    ) {
      return;
    }

    try {
      await AuthAPI.changePassword(
        userData.username,
        editData.password,
        editData.newPassword
      );
      setIsEditing(false);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 401) {
          setPasswordError(true);
          setPasswordErrorMessage("Current password is incorrect");
        } else {
          alert("An error occurred while changing password");
        }
      }
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <Stack sx={{ p: { xs: 2, sm: 4 }, minHeight: "100vh" }}>
        <Card>
          <ProfileHeader>
            <Avatar
              src={userData.avatarUrl}
              sx={{ width: 125, height: 125 }}
              alt={userData.username}
            />
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Typography variant="h4" gutterBottom>
                  {userData.username}
                </Typography>
                {!isEditing && (
                  <IconButton onClick={() => setIsEditing(true)} size="small">
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
              <Typography color="text.secondary">
                🗓 {userData.joinDate}
              </Typography>
            </Box>
          </ProfileHeader>

          {isEditing ? (
            <Box
              component="form"
              onSubmit={(e) => {
                void handleSubmit(e);
              }}
              sx={{ display: "flex", flexDirection: "column", gap: 0.1 }}
            >
              <FormControl sx={{ height: "90px", mb: 1 }}>
                <FormLabel htmlFor="current-password">
                  Current Password
                </FormLabel>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="current-password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  variant="outlined"
                  value={editData.password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditData({ ...editData, password: value });
                    validatePassword(value);
                  }}
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
                <FormLabel htmlFor="new-password">New Password</FormLabel>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name="newPassword"
                  placeholder="••••••"
                  type="password"
                  id="new-password"
                  autoComplete="new-password"
                  required
                  fullWidth
                  variant="outlined"
                  value={editData.newPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditData({ ...editData, newPassword: value });
                    validatePassword(value);
                    if (editData.confirmPassword) {
                      validateConfirmPassword(value, editData.confirmPassword);
                    }
                  }}
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
                <FormLabel htmlFor="confirm-password">
                  Confirm New Password
                </FormLabel>
                <TextField
                  error={confirmPasswordError}
                  helperText={confirmPasswordErrorMessage}
                  name="confirmPassword"
                  placeholder="••••••"
                  type="password"
                  id="confirm-password"
                  autoComplete="new-password"
                  required
                  fullWidth
                  variant="outlined"
                  value={editData.confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditData({ ...editData, confirmPassword: value });
                    validateConfirmPassword(editData.newPassword, value);
                  }}
                  color={confirmPasswordError ? "error" : "primary"}
                  sx={{
                    "& .MuiFormHelperText-root": {
                      minHeight: "20px",
                      margin: "3px 14px 0",
                    },
                  }}
                />
              </FormControl>

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                >
                  Save Changes
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(userData);
                    setPasswordError(false);
                    setPasswordErrorMessage("");
                    setConfirmPasswordError(false);
                    setConfirmPasswordErrorMessage("");
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Profile Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>{userData.username[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={userData.username}
                    secondary={userData.joinDate}
                  />
                </ListItem>
              </List>
            </>
          )}
        </Card>
      </Stack>
    </AppTheme>
  );
}
