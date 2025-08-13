import { useFeatureFlagsContext } from "@/context/FeatureFlagsContext";

export const useFeatureFlags = () => {
  const { previewMode, setPreviewMode, previewModePhotos, setPreviewModePhotos } = useFeatureFlagsContext();
  return {
    previewMode,
    setPreviewMode,
    previewModePhotos,
    setPreviewModePhotos,
    // Helper to quickly toggle via dev console if needed: window.togglePreviewMode?.()
    togglePreviewMode: () => setPreviewMode(!previewMode),
    togglePreviewModePhotos: () => setPreviewModePhotos(!previewModePhotos),
  };
};
