// Helper function to get the base URL of the application
export const getBaseUrl = (): string => {
  return window.location.origin;
};

// Helper function to get absolute URL for sharing
export const getAbsoluteUrl = (path: string): string => {
  // If it's already an absolute URL, return as is
  if (path.startsWith('http')) {
    return path;
  }

  // Get the base URL of the application
  const baseUrl = getBaseUrl();
  
  // Clean the path (remove leading slash if present)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine base URL with clean path
  return `${baseUrl}/${cleanPath}`;
};

import PreviewImage from '../assets/images/preview.webp';

// Helper function to get preview image URL
export const getPreviewImageUrl = (): string => {
  return PreviewImage;
};

// Helper function to create a shareable song URL
export const createShareableSongUrl = (songPath: string): string => {
  const baseUrl = getBaseUrl();
  const cleanPath = songPath.startsWith('/') ? songPath.slice(1) : songPath;
  return `${baseUrl}/play/${cleanPath}`;
}; 