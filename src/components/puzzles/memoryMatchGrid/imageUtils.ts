/**
` * Memory Match Grid - Cloudinary Image Manager
 * 
 * This utility manages images for the memory game.
 * Currently uses local images from public/images folder.
 * Can be switched to Cloudinary when needed.
 * 
 * 🚀 CURRENT SETUP: Using local images from /images/ folder
 * 📁 Images: memory_1.png through memory_12.png
 * 
 * 💡 TO SWITCH TO CLOUDINARY:
 * 1. Upload images to Cloudinary
 * 2. Update CLOUDINARY_IMAGES array with your URLs
 * 3. Change USE_LOCAL_IMAGES to false
 */

// Set to true to use local images from public/images folder
const USE_LOCAL_IMAGES = true;
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const CLOUDINARY_ENABLED = import.meta.env.VITE_CLOUDINARY_ENABLED === "true";

// Local images from public/images folder
// These are the current images available in your project
export const LOCAL_IMAGES = [
  "/images/memory_1.png",
  "/images/memory_2.png",
  "/images/memory_3.png",
  "/images/memory_4.png",
  "/images/memory_5.png",
  "/images/memory_6.png",
  "/images/memory_7.png",
  "/images/memory_8.png",
  "/images/memory_9.png",
  "/images/memory_10.png",
  "/images/memory_11.png",
  "/images/memory_12.png",
  "/images/memory_13.png",
  "/images/memory_14.png",
  "/images/memory_15.png",
  "/images/memory_16.png",
  "/images/memory_17.png",
  "/images/memory_18.png",
  "/images/memory_19.png",
  "/images/memory_20.png",
  "/images/memory_21.png",
];

// Default placeholder images (fallback)
export const DEFAULT_MEMORY_IMAGES = [
  "https://via.placeholder.com/300x400/FF6B6B/ffffff?text=Image+1",
  "https://via.placeholder.com/300x400/4ECDC4/ffffff?text=Image+2",
  "https://via.placeholder.com/300x400/45B7D1/ffffff?text=Image+3",
  "https://via.placeholder.com/300x400/FFA07A/ffffff?text=Image+4",
  "https://via.placeholder.com/300x400/98D8C8/ffffff?text=Image+5",
  "https://via.placeholder.com/300x400/F7DC6F/ffffff?text=Image+6",
  "https://via.placeholder.com/300x400/BB8FCE/ffffff?text=Image+7",
  "https://via.placeholder.com/300x400/85C1E2/ffffff?text=Image+8",
  "https://via.placeholder.com/300x400/F8B739/ffffff?text=Image+9",
  "https://via.placeholder.com/300x400/52BE80/ffffff?text=Image+10",
  "https://via.placeholder.com/300x400/E74C3C/ffffff?text=Image+11",
  "https://via.placeholder.com/300x400/3498DB/ffffff?text=Image+12",
  "https://via.placeholder.com/300x400/9B59B6/ffffff?text=Image+13",
  "https://via.placeholder.com/300x400/1ABC9C/ffffff?text=Image+14",
  "https://via.placeholder.com/300x400/F39C12/ffffff?text=Image+15",
];

// ⚠️ IMPORTANT: Replace these URLs with your actual Cloudinary image URLs
// Your Cloudinary URLs should look like:
// https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123456789/folder/image.jpg
// 
// To get your URLs:
// 1. Go to https://cloudinary.com/console
// 2. Upload images to Media Library
// 3. Click on an image and copy the "Secure URL"
// 4. Paste all 15 URLs below (minimum 10 for individual mode, 15 for group mode)
export const CLOUDINARY_IMAGES = [
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image1.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image2.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image3.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image4.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image5.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image6.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image7.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image8.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image9.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image10.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image11.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image12.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image13.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image14.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image15.jpg",
];

/**
 * Upload image to Cloudinary
 * @param file - The image file to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Secure URL of uploaded image
 */
export const uploadToCloudinary = async (
  file: File,
  folder: string = "memory_game"
): Promise<string | null> => {
  const fileToBase64 = (inputFile: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("Failed to read image"));
      reader.readAsDataURL(inputFile);
    });

  try {
    // Try local-first upload so the app works fully offline.
    const base64Data = await fileToBase64(file);
    const localResponse = await fetch(`${API_URL}/media/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64Data,
        fileName: file.name,
        mimeType: file.type,
        mediaType: "images",
      }),
    });

    if (localResponse.ok) {
      const localPayload = await localResponse.json();
      return localPayload.localUrl?.startsWith("http")
        ? localPayload.localUrl
        : `${API_URL}${localPayload.localUrl}`;
    }
  } catch (error) {
    console.warn("Local media upload failed:", error);
  }
  if (!CLOUDINARY_ENABLED) {
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default");
  formData.append("folder", folder);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/dmebh0vcd/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

/**
 * Fetch images from backend API
 * @param apiUrl - Backend API URL
 * @returns Array of image URLs
 */
export const fetchMemoryImages = async (apiUrl: string): Promise<string[]> => {
  try {
    const response = await fetch(`${apiUrl}/puzzles/images`);
    if (!response.ok) throw new Error("Failed to fetch images");
    const data = await response.json();
    return data.images || DEFAULT_MEMORY_IMAGES;
  } catch (error) {
    console.error("Error fetching memory images:", error);
    return DEFAULT_MEMORY_IMAGES;
  }
};

/**
 * Validate image URL
 * @param url - Image URL to validate
 * @returns Promise<boolean>
 */
export const validateImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get images based on configuration
 * Uses local images from public/images/ when USE_LOCAL_IMAGES is true
 * Falls back to Cloudinary or placeholder images otherwise
 * Returns a shuffled copy so random images are picked each game
 */
export const getMemoryImages = (): string[] => {
  // Use local images from public folder if configured
  if (USE_LOCAL_IMAGES) {
    return shuffleArray(LOCAL_IMAGES);
  }

  // Check if Cloudinary images are properly configured
  const hasCloudinaryImages = CLOUDINARY_IMAGES.some(url => 
    !url.includes('v1/memory_game')
  );

  if (!hasCloudinaryImages) {
    console.warn("Using placeholder images. Configure Cloudinary URLs for production.");
    return shuffleArray(DEFAULT_MEMORY_IMAGES);
  }

  return shuffleArray(CLOUDINARY_IMAGES);
};

/**
 * Batch upload multiple images
 * @param files - Array of files to upload
 * @param folder - Cloudinary folder name
 * @returns Array of uploaded image URLs
 */
export const batchUploadToCloudinary = async (
  files: File[],
  folder: string = "memory_game"
): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
};

/**
 * Generate optimized Cloudinary URL with transformations
 * @param publicId - Cloudinary public ID
 * @param width - Desired width
 * @param height - Desired height
 * @returns Optimized URL
 */
export const getOptimizedImageUrl = (
  publicId: string,
  width: number = 300,
  height: number = 400
): string => {
  const cloudName = "dmebh0vcd";
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${publicId}`;
};
