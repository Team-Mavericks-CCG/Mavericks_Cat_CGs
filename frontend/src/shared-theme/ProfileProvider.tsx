import React, { useState } from "react";
import { ProfileContext } from "./ProfileContext";

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
