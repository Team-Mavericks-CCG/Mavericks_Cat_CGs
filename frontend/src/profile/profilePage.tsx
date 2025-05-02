import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
//import List from "@mui/material/List";
import FormLabel from "@mui/material/FormLabel";
//import ListItem from "@mui/material/ListItem";
//import ListItemAvatar from "@mui/material/ListItemAvatar";
//import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import AppTheme from "../shared-theme/AppTheme";
import ColorModeSelect from "../shared-theme/ColorModeSelect";
import { AuthAPI } from "../utils/api";
//import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { FormControl } from "@mui/material";
import { useContext } from "react";
import { ProfileContext } from "../shared-theme/ProfileContext";

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
    maxWidth: "850px", // Increased maxWidth to make the card wider
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
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row", // Ensure proper layout for wider cards
    alignItems: "flex-start",
  },
}));

interface UserData {
  username: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
  avatarUrl: string;
  joinDate: string;
  profilePicture: number;
}

const getProfilePictureUrl = (profilePicture: number): string =>
  `/assets/pfp/catPFP${profilePicture}.webp`;

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
    profilePicture: 1, // Default value for profilePicture
  });
  const [editData, setEditData] = React.useState(userData);
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    React.useState("");
  const { setProfilePicture } = useContext(ProfileContext);

  React.useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token === null) {
      setUserData({ ...userData, avatarUrl: "/assets/pfp/defaultAvatar.webp" }); // Default avatar when signed out
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
          joinDate: `Joined ${new Date(
            data.user.createdAt
          ).toLocaleDateString()}`,
          avatarUrl: getProfilePictureUrl(data.user.profilePicture),
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
  }, [navigate, userData.profilePicture]); // Add dependency to re-fetch when profile picture changes

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

    // Update profile picture
    const match = /catPFP(\d+)/.exec(editData.avatarUrl);
    const profilePicNum = parseInt(match?.[1] ?? "1", 10);
    if (profilePicNum !== userData.profilePicture) {
      try {
        await AuthAPI.updateProfilePicture(profilePicNum);
        const updatedProfile = await AuthAPI.getProfile(); // Fetch updated profile
        setUserData({
          ...userData,
          profilePicture: updatedProfile.data.user.profilePicture,
        }); // Update userData
        setProfilePicture(
          getProfilePictureUrl(updatedProfile.data.user.profilePicture)
        ); // Update global state
        window.location.reload(); // Reload the page to reflect changes
      } catch (error) {
        console.error("Error updating profile picture", error);
        alert("Failed to update profile picture. Please try again.");
        return;
      }
    }

    setIsEditing(false);
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
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
      alert("Password changed successfully");
      setEditData({
        ...editData,
        password: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error changing password", err);
      alert("Failed to change password. Please try again.");
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

          <Box>
            {isEditing ? (
              <Box
                component="form"
                onSubmit={(e) => {
                  void handleSubmit(e);
                }}
                sx={{ display: "flex", flexDirection: "column", gap: 0.1 }}
              >
                {/* Profile Picture Section */}
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Profile Picture
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                    <Avatar
                      key={num}
                      src={`/assets/pfp/catPFP${num}.webp`}
                      sx={{
                        width: 60,
                        height: 60,
                        cursor: "pointer",
                        border:
                          editData.avatarUrl === `/assets/pfp/catPFP${num}.webp`
                            ? "2px solid #1976d2"
                            : "none",
                      }}
                      onClick={() =>
                        setEditData({
                          ...editData,
                          avatarUrl: `/assets/pfp/catPFP${num}.webp`,
                        })
                      }
                    />
                  ))}
                </Box>

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
                  Friends:
                </Typography>
              </>
            )}

            {/* Change Password Section */}
            {isEditing && (
              <Box
                component="form"
                onSubmit={(e) => {
                  void handlePasswordChange(e);
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.1,
                  mt: 4,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Change Password
                </Typography>
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
                        validateConfirmPassword(
                          value,
                          editData.confirmPassword
                        );
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
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Change Password
                </Button>
              </Box>
            )}
          </Box>
        </Card>
      </Stack>
    </AppTheme>
  );
}
