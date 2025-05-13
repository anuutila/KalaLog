import imageCompression, { Options } from "browser-image-compression";

export async function optimizeImage(file: File): Promise<File> {
  const options: Options = {
    maxSizeMB: 4, // Target file size
    useWebWorker: true, // Use Web Workers for faster processing
    alwaysKeepResolution: true, // Keep the original resolution
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log('Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compressed size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    return compressedFile;
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw error;
  }
}