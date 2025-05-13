export function generateCatchFolderName(catchNumber: number): string {
  return `${process.env.CLOUDINARY_ROOT_FOLDER}/catches/catch_${String(catchNumber).padStart(5, '0')}`;
}

export function generateEventFolderName(eventId: string): string {
  return `${process.env.CLOUDINARY_ROOT_FOLDER}/events/event_${String(eventId).padStart(5, '0')}`;
}

export function generateCatchPublicId(catchNumber: number, imageIndex: number): string {
  return `catch_${String(catchNumber).padStart(5, '0')}_img_${String(imageIndex).padStart(2, '0')}`;
}

export function generateEventPublicId(eventId: string, imageIndex: number): string {
  return `event_${String(eventId).padStart(5, '0')}_img_${String(imageIndex).padStart(2, '0')}`;
}



// Extract the publicId from the Cloudinary URL
export function extractPublicId(url: string): string {
  const startIndex = url.indexOf('KalaLog'); // Find where "KalaLog" folder starts
  if (startIndex === -1) {
    throw new Error('Unexpected URL structure');
  }
  return url.substring(startIndex, url.lastIndexOf('.')); // Extract up to the file extension
}

// Extract the folder name from the Cloudinary URL
export function extractFolderName(url: string): string {
  const startIndex = url.indexOf('KalaLog'); // Find where "KalaLog" folder starts
  if (startIndex === -1) {
    throw new Error('Unexpected URL structure');
  }
  return url.substring(startIndex, url.lastIndexOf('/')); // Extract up to the file name
}

// Extract the publicId from the Cloudinary URL
export function extractNextImageIndex(urls: string[]): number {
  const indexes: number[] = [0];
  urls.forEach((url) => {
    const startIndex = url.indexOf('img_'); // Find where the image index starts
    if (startIndex === -1) {
      throw new Error('Unexpected URL structure');
    }
    const index: string = url.substring(startIndex).split('_')[1];
    indexes.push(parseInt(index, 10));
  });
  return Math.max(...indexes) + 1;
}