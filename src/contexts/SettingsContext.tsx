import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [geminiApiKey, setApiKey] = useState(() => localStorage.getItem('geminiApiKey') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const setGeminiApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('geminiApiKey', key);
  };

  return (
    <SettingsContext.Provider value={{ geminiApiKey, setGeminiApiKey, isSettingsOpen, setIsSettingsOpen }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings phải được sử dụng bên trong SettingsProvider');
  return ctx;
}
