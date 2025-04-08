
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
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const mockFriends = [
  { id: 1, name: 'Alice Johnson', avatar: '' },
  { id: 2, name: 'Bob Smith', avatar: '' },
  { id: 3, name: 'Carol Williams', avatar: '' },
];

export default function ProfilePage(props: { disableCustomTheme?: boolean }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [userData, setUserData] = React.useState({
    username: 'JohnDoe',
    email: 'john@example.com',
    avatarUrl: '',
    bio: 'Cat games enthusiast',
    joinDate: 'Joined March 2024'
  });
  const [editData, setEditData] = React.useState(userData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(userData);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!response.ok) throw new Error('Failed to save profile');
      setUserData(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
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
                  <IconButton onClick={handleEdit} size="small">
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
              <Typography color="text.secondary" gutterBottom>
                {userData.email}
              </Typography>
              <Typography>{userData.bio}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography color="text.secondary">🗓 {userData.joinDate}</Typography>
              </Box>
            </Box>
          </ProfileHeader>

          {isEditing ? (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Username"
                value={editData.username}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
              />
              <TextField
                label="Email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
              <TextField
                label="Bio"
                multiline
                rows={3}
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleSave}>Save Changes</Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Friends</Typography>
              <List>
                {mockFriends.map((friend) => (
                  <ListItem key={friend.id}>
                    <ListItemAvatar>
                      <Avatar src={friend.avatar}>{friend.name[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={friend.name} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Card>
      </Stack>
    </AppTheme>
  );
}
