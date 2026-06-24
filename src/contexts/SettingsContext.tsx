import React, { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  groqApiKey: string;
  setGroqApiKey: (key: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [groqApiKey, setApiKey] = useState(() => localStorage.getItem('groqApiKey') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const setGroqApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('groqApiKey', key);
  };

  return (
    <SettingsContext.Provider value={{ groqApiKey, setGroqApiKey, isSettingsOpen, setIsSettingsOpen }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings phải được sử dụng bên trong SettingsProvider');
  return ctx;
}
