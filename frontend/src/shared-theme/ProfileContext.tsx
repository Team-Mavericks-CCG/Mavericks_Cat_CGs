import { createContext } from "react";

export const ProfileContext = createContext({
  profilePicture: "/assets/pfp/default.webp",
  setProfilePicture: (url: string) => {
    console.warn("setProfilePicture is called before initialization:", url);
  },
});
