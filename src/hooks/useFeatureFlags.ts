import { useFeatureFlagsContext } from "@/context/FeatureFlagsContext";

export const useFeatureFlags = () => {
  const { previewMode, setPreviewMode } = useFeatureFlagsContext();
  return {
    previewMode,
    setPreviewMode,
    // Helper to quickly toggle via dev console if needed: window.togglePreviewMode?.()
    togglePreviewMode: () => setPreviewMode(!previewMode),
  };
};
