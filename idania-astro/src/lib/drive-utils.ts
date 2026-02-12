/**
 * Utilidades para manejar archivos de Google Drive
 */

export type FileCategory = 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'text' | 'other';

/**
 * Determina la categoría de un archivo basándose en su MIME type
 */
export function getFileCategory(mimeType: string): FileCategory {
  if (!mimeType) return 'other';

  // Imágenes
  if (mimeType.startsWith('image/')) return 'image';

  // Videos
  if (mimeType.startsWith('video/')) return 'video';

  // Audio
  if (mimeType.startsWith('audio/')) return 'audio';

  // PDF
  if (mimeType === 'application/pdf') return 'pdf';

  // Google Workspace
  if (mimeType === 'application/vnd.google-apps.document') return 'document';
  if (mimeType === 'application/vnd.google-apps.spreadsheet') return 'spreadsheet';
  if (mimeType === 'application/vnd.google-apps.presentation') return 'presentation';

  // Microsoft Office
  if (mimeType.includes('word')) return 'document';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'spreadsheet';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'presentation';

  // Texto
  if (mimeType.startsWith('text/')) return 'text';

  return 'other';
}

/**
 * Determina si un archivo es previsualizable (solo imágenes y videos)
 */
export function isPreviewable(mimeType: string): boolean {
  const category = getFileCategory(mimeType);
  return category === 'image' || category === 'video';
}

/**
 * Obtiene el nombre del icono Lucide apropiado para un tipo de archivo
 */
export function getFileIcon(category: FileCategory): string {
  switch (category) {
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'audio':
      return 'music';
    case 'pdf':
      return 'file-text';
    case 'document':
      return 'file-text';
    case 'spreadsheet':
      return 'sheet';
    case 'presentation':
      return 'presentation';
    case 'text':
      return 'file-code';
    default:
      return 'file';
  }
}

/**
 * Obtiene el color asociado a una categoría de archivo (para badges)
 */
export function getFileColor(category: FileCategory): string {
  switch (category) {
    case 'image':
      return '#ea4335'; // Rojo de Google
    case 'video':
      return '#4285f4'; // Azul de Google
    case 'audio':
      return '#fbbc04'; // Amarillo de Google
    case 'pdf':
      return '#ea4335'; // Rojo
    case 'document':
      return '#4285f4'; // Azul
    case 'spreadsheet':
      return '#34a853'; // Verde de Google
    case 'presentation':
      return '#fbbc04'; // Amarillo
    case 'text':
      return '#666';
    default:
      return '#999';
  }
}

/**
 * Formatea el tamaño de un archivo a formato legible (KB, MB, GB)
 */
export function formatFileSize(bytes: number | string | undefined): string {
  if (!bytes) return 'N/A';

  const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;

  if (isNaN(size)) return 'N/A';
  if (size === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(k));

  return `${(size / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Formatea una fecha a formato legible en español
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Valida que un fileId sea válido (alfanumérico, guiones y guiones bajos)
 */
export function validateFileId(fileId: string | undefined): boolean {
  if (!fileId) return false;
  // Google Drive file IDs son alfanuméricos con guiones y guiones bajos
  return /^[a-zA-Z0-9_-]+$/.test(fileId);
}

/**
 * Mapeo de MIME types de Google Workspace a formatos de exportación
 */
export const EXPORT_FORMATS: Record<string, { mimeType: string; extension: string }> = {
  'application/vnd.google-apps.document': {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: '.docx',
  },
  'application/vnd.google-apps.spreadsheet': {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: '.xlsx',
  },
  'application/vnd.google-apps.presentation': {
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extension: '.pptx',
  },
};

/**
 * Determina si un archivo es de Google Workspace y necesita exportación
 */
export function isGoogleWorkspaceFile(mimeType: string): boolean {
  return mimeType.startsWith('application/vnd.google-apps.');
}

/**
 * Obtiene el formato de exportación para un archivo de Google Workspace
 */
export function getExportFormat(mimeType: string): { mimeType: string; extension: string } | null {
  return EXPORT_FORMATS[mimeType] || null;
}

/**
 * Trunca un nombre de archivo si es muy largo
 */
export function truncateFilename(filename: string, maxLength: number = 30): string {
  if (filename.length <= maxLength) return filename;

  const extension = filename.substring(filename.lastIndexOf('.'));
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3);

  return `${truncatedName}...${extension}`;
}

/**
 * Obtiene el label en español para una categoría de archivo
 */
export function getCategoryLabel(category: FileCategory): string {
  switch (category) {
    case 'image':
      return 'Imagen';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Audio';
    case 'pdf':
      return 'PDF';
    case 'document':
      return 'Documento';
    case 'spreadsheet':
      return 'Hoja de cálculo';
    case 'presentation':
      return 'Presentación';
    case 'text':
      return 'Texto';
    default:
      return 'Archivo';
  }
}
