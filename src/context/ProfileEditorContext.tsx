import React, { createContext, useContext, useState, useCallback } from 'react';
import { EditProfileModal } from '../components/dashboard/EditProfileModal';

interface ProfileEditorContextType {
  openEditProfile: () => void;
  closeEditProfile: () => void;
}

const ProfileEditorContext = createContext<ProfileEditorContextType>({
  openEditProfile: () => {},
  closeEditProfile: () => {},
});

/** Mount once (inside AuthProvider). Any component can then call useProfileEditor().openEditProfile(). */
export const ProfileEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const openEditProfile = useCallback(() => setOpen(true), []);
  const closeEditProfile = useCallback(() => setOpen(false), []);
  return (
    <ProfileEditorContext.Provider value={{ openEditProfile, closeEditProfile }}>
      {children}
      <EditProfileModal isOpen={open} onClose={closeEditProfile} />
    </ProfileEditorContext.Provider>
  );
};

export const useProfileEditor = () => useContext(ProfileEditorContext);
