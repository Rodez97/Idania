/**
 * Shared utilities for Drive Viewer
 */

export function formatFileSize(bytes: string | number | undefined): string {
  if (!bytes) return 'N/A';
  const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(size) || size === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return `${(size / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

export function truncateFilename(filename: string, maxLength: number = 30): string {
  if (filename.length <= maxLength) return filename;
  const extension = filename.substring(filename.lastIndexOf('.'));
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3);
  return `${truncatedName}...${extension}`;
}
