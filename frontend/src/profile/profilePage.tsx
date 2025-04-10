
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import AppTheme from "../shared-theme/AppTheme";
import ColorModeSelect from "../shared-theme/ColorModeSelect";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

interface UserResponse {
  message: string;
  user: {
    username: string;
    lastLogin: string;
  };
}

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow: theme.shadows[1],
  [theme.breakpoints.up('sm')]: {
    width: '700px',
  },
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

interface UserData {
  username: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
  avatarUrl: string;
  joinDate: string;
};

export default function ProfilePage(props: { disableCustomTheme?: boolean }): React.JSX.Element {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);
  const [userData, setUserData] = React.useState<UserData>({
    username: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    avatarUrl: '',
    joinDate: ''
  });
  const [editData, setEditData] = React.useState(userData);
  const [errors, setErrors] = React.useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      void navigate('/signin');
      return;
    }

    // Verify token and get user data
    axios.get('http://localhost:5000/api/auth/verify', {
      headers: { 'Authorization': token }
    })
    .then((response) => {
      const data = response.data as UserResponse;
      setUserData({
        ...userData,
        username: data.user.username,
        joinDate: `Joined ${new Date(data.user.lastLogin).toLocaleDateString()}`
      });
      setEditData({
        ...editData,
        username: data.user.username
      });
    })
    .catch(() => {
      localStorage.removeItem('authToken');
      void navigate('/signin');
    });
  }, []);

  const validateForm = () => {
    const username = document.getElementById("username") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const confirmPassword = document.getElementById("confirmPassword") as HTMLInputElement;
    const newErrors = { username: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!username.value || username.value.length < 3) {
      newErrors.username = "Username must be at least 3 characters long.";
      isValid = false;
    }

    if (password.value && password.value.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
      isValid = false;
    }

    if (confirmPassword.value !== password.value) {
      newErrors.confirmPassword = "Passwords must match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:5000/api/auth/change-password', {
        username: editData.username,
        password: editData.password,
        newPassword: editData.newPassword
      }, {
        headers: { 'Authorization': token }
      });

      setUserData({
        ...userData,
        username: editData.username
      });
      setIsEditing(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        if (status === 409) {
          setErrors(prev => ({ ...prev, username: "Username already taken" }));
        } else if (status === 401) {
          setErrors(prev => ({ ...prev, password: "Current password is incorrect" }));
        }
      }
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <Stack sx={{ p: { xs: 2, sm: 4 }, minHeight: '100vh' }}>
        <Card>
          <ProfileHeader>
            <Avatar
              src={userData.avatarUrl}
              sx={{ width: 150, height: 150 }}
              alt={userData.username}
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h4" gutterBottom>
                  {userData.username}
                </Typography>
                {!isEditing && (
                  <IconButton onClick={() => setIsEditing(true)} size="small">
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
              <Typography color="text.secondary">🗓 {userData.joinDate}</Typography>
            </Box>
          </ProfileHeader>

          {isEditing ? (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                id="username"
                label="Username"
                value={editData.username}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                error={!!errors.username}
                helperText={errors.username}
              />
              <TextField
                id="password"
                label="Current Password"
                type="password"
                value={editData.password}
                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                error={!!errors.password}
                helperText={errors.password}
              />
              <TextField
                id="newPassword"
                label="New Password"
                type="password"
                value={editData.newPassword}
                onChange={(e) => setEditData({ ...editData, newPassword: e.target.value })}
              />
              <TextField
                id="confirmPassword"
                label="Confirm New Password"
                type="password"
                value={editData.confirmPassword}
                onChange={(e) => setEditData({ ...editData, confirmPassword: e.target.value })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button variant="contained" onClick={() => void handleSave()}>Save Changes</Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Profile Information</Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>{userData.username[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={userData.username} secondary={userData.joinDate} />
                </ListItem>
              </List>
            </>
          )}
        </Card>
      </Stack>
    </AppTheme>
  );
}
