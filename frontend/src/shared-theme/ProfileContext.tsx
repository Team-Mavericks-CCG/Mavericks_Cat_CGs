import React, { createContext, useState } from "react";

export const ProfileContext = createContext({
  profilePicture: "/assets/pfp/default.webp",
  setProfilePicture: (url: string) => {
    console.warn("setProfilePicture is called before initialization:", url);
  },
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profilePicture, setProfilePicture] = useState(
    "/assets/pfp/default.webp"
  );

  return (
    <ProfileContext.Provider value={{ profilePicture, setProfilePicture }}>
      {children}
    </ProfileContext.Provider>
  );
};
