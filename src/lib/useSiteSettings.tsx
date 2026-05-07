import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

interface SiteSettings {
  [key: string]: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time sync for global settings
    const unsubscribe = onSnapshot(collection(db, 'settings'), (snapshot) => {
      const sData: SiteSettings = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.key && data.value !== undefined) {
          sData[data.key] = data.value;
        }
      });
      setSettings(sData);
      setLoading(false);
    }, (error) => {
      console.error("Error syncing settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
