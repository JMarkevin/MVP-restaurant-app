// Image upload utility functions

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload image to a free image hosting service
 * Using PostImage API (free, no API key required)
 */
export const uploadImageToHosting = async (
  file: File
): Promise<ImageUploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://postimages.org/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();

    if (data.success && data.data?.url) {
      return {
        success: true,
        url: data.data.url,
      };
    } else {
      throw new Error('Upload response invalid');
    }
  } catch (error) {
    console.error('Image upload failed:', error);
    return {
      success: false,
      error: 'Failed to upload image',
    };
  }
};

/**
 * Convert file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error('Failed to convert file to base64'));
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (
  file: File
): { valid: boolean; error?: string } => {
  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { valid: false, error: 'Image size must be less than 2MB' };
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file' };
  }

  // Check file extensions
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPG, PNG, GIF, WebP)',
    };
  }

  return { valid: true };
};

/**
 * Generate initials from name
 */
export const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Create object URL for preview
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revoke object URL to free memory
 */
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};
