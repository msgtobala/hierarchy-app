import React, { createContext, useContext, useState } from 'react';

interface LevelContextType {
  selectedLevel: number;
  setSelectedLevel: (level: number) => void;
}

const LevelContext = createContext<LevelContextType>({
  selectedLevel: 1,
  setSelectedLevel: () => {},
});

export function LevelProvider({ children }: { children: React.ReactNode }) {
  const [selectedLevel, setSelectedLevel] = useState(1);

  return (
    <LevelContext.Provider value={{ selectedLevel, setSelectedLevel }}>
      {children}
    </LevelContext.Provider>
  );
}

export const useLevel = () => useContext(LevelContext);