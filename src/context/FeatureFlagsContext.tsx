import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

interface FeatureFlagsContextValue {
  previewMode: boolean;
  setPreviewMode: (value: boolean) => void;
  previewModePhotos: boolean;
  setPreviewModePhotos: (value: boolean) => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | undefined>(undefined);

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default: true, can be overridden by localStorage key "preview_mode" ("true" | "false")
  const [previewMode, setPreviewMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("preview_mode");
    return stored !== null ? stored === "true" : true;
  });

  // Default: true, can be overridden by localStorage key "preview_mode_photos" ("true" | "false")
  const [previewModePhotos, setPreviewModePhotos] = useState<boolean>(() => {
    const stored = localStorage.getItem("preview_mode_photos");
    return stored !== null ? stored === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("preview_mode", String(previewMode));
  }, [previewMode]);

  useEffect(() => {
    localStorage.setItem("preview_mode_photos", String(previewModePhotos));
  }, [previewModePhotos]);

  const value = useMemo(() => ({ 
    previewMode, 
    setPreviewMode, 
    previewModePhotos, 
    setPreviewModePhotos 
  }), [previewMode, previewModePhotos]);

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
};

export const useFeatureFlagsContext = () => {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error("useFeatureFlagsContext must be used within FeatureFlagsProvider");
  return ctx;
};
