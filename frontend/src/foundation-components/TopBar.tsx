import React, { useContext, useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ThemeToggle from "../shared-theme/ColorModeToggle";
import { useColorScheme } from "@mui/material/styles";
import CardThemeSelector from "./CardThemeSelector";
import { ProfileContext } from "../shared-theme/ProfileContext";
import { AuthAPI } from "../utils/api";

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { mode } = useColorScheme();
  const { setProfilePicture } = useContext(ProfileContext);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "/assets/pfp/defaultAvatar.webp"
  );

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await AuthAPI.getProfilePicture();
        const profilePictureId = response.data.profilePicture;
        setAvatarUrl(`/assets/pfp/catPFP${profilePictureId}.webp`);
        setProfilePicture(`/assets/pfp/catPFP${profilePictureId}.webp`);
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    void fetchProfilePicture();
  }, [setProfilePicture]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    localStorage.removeItem("profilePicture");
    // Navigate to home page
    void navigate("/");
    handleMenuClose();
    window.location.reload(); // Reload the page to reflect changes
  };

  const handleProfile = () => {
    void navigate("/profile");
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        bgcolor:
          mode === "dark"
            ? "rgba(18, 18, 18, 0.85)"
            : "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${
          mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)"
        }`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo and App Name */}
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            color: "primary.main",
            textDecoration: "none",
            "&:hover": {
              color: "primary.dark",
            },
          }}
        >
          Cat Games R Us
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
          <CardThemeSelector compact={true} />

          <Tooltip title="Home">
            <IconButton
              color="primary"
              component={RouterLink}
              to="/"
              aria-label="home"
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
              <HomeIcon />
            </IconButton>
          </Tooltip>

          <ThemeToggle />

          <Tooltip title="Account settings">
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              aria-controls={anchorEl ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={anchorEl ? "true" : undefined}
              sx={{
                width: 40,
                height: 40,
                padding: 1,
                mx: 2,
                boxShadow: "none",
                transition: "transform 0.15s",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.04)",
                  boxShadow: "none",
                },
              }}
            >
              <img
                src={avatarUrl}
                alt="User Avatar"
                style={{ width: "32px", height: "32px", borderRadius: "50%" }}
              />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1.5,
                border:
                  mode === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.12)"
                    : "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: 1.5,
                boxShadow: "none",
              },
            }}
          >
            <MenuItem
              onClick={handleProfile}
              sx={{
                borderRadius: 1,
                mx: 0.5,
                my: 0.3,
                "&:hover": {
                  bgcolor:
                    mode === "dark"
                      ? "rgba(144, 202, 249, 0.08)"
                      : "rgba(25, 118, 210, 0.08)",
                },
              }}
            >
              Profile
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                borderRadius: 1,
                mx: 0.5,
                my: 0.3,
                "&:hover": {
                  bgcolor:
                    mode === "dark"
                      ? "rgba(144, 202, 249, 0.08)"
                      : "rgba(25, 118, 210, 0.08)",
                },
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
