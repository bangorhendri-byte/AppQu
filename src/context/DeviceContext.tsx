import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DeviceContextType {
  isMobile: boolean; // True if window < 768px OR mobile simulation mode active
  isMobileMode: boolean; // User simulation toggle in AndroidFrame
  setIsMobileMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isSafeAreaEnabled: boolean;
  setIsSafeAreaEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
}

const DeviceContext = createContext<DeviceContextType>({
  isMobile: false,
  isMobileMode: false,
  setIsMobileMode: () => {},
  isSafeAreaEnabled: true,
  setIsSafeAreaEnabled: () => {},
});

export const useDevice = () => useContext(DeviceContext);

interface DeviceProviderProps {
  children: React.ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [isWindowMobile, setIsWindowMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [isMobileMode, setIsMobileMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [isSafeAreaEnabled, setIsSafeAreaEnabled] = useState<boolean>(true);

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 768;
      setIsWindowMobile(isSmall);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = isWindowMobile || isMobileMode;

  return (
    <DeviceContext.Provider
      value={{
        isMobile,
        isMobileMode,
        setIsMobileMode,
        isSafeAreaEnabled,
        setIsSafeAreaEnabled,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};
