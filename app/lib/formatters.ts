/**
 * Formats a number of bytes into a human-readable string
 * @param bytes - The number of bytes to format
 * @param decimals - Number of decimal places to display (default: 2)
 * @returns A human-readable size string (e.g., "1.5 MB", "2.3 GB")
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (bytes / Math.pow(k, i)).toFixed(decimals) + ' ' + sizes[i];
}

/**
 * Alternative implementation with stricter control
 * @param bytes - The number of bytes to format
 * @param decimals - Number of decimal places to display (default: 2)
 * @returns A human-readable size string
 */
export function formatSize(bytes: number, decimals: number = 2): string {
  if (bytes < 0) {
    throw new Error('Bytes must be a non-negative number');
  }

  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const factor = 1024;
  let unitIndex = 0;
  let size = bytes;

  while (size >= factor && unitIndex < units.length - 1) {
    size /= factor;
    unitIndex++;
  }

  return parseFloat(size.toFixed(decimals)) + ' ' + units[unitIndex];
}
