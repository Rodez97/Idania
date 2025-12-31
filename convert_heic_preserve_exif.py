import os
from PIL import Image
from pillow_heif import register_heif_opener

# Registrar el opener de HEIF
register_heif_opener()

# Directorios
source_dir = r"D:\Personal\Idania\Photos-1-001"
output_dir = r"D:\Personal\Idania\idania-astro\public\images"

# Crear directorio de salida si no existe
os.makedirs(output_dir, exist_ok=True)

# Obtener archivos HEIC
heic_files = [f for f in os.listdir(source_dir) if f.lower().endswith('.heic')]

print(f"Encontrados {len(heic_files)} archivos HEIC para convertir\n")

converted = 0
for filename in heic_files:
    input_path = os.path.join(source_dir, filename)
    output_filename = filename.replace('.HEIC', '.jpg').replace('.heic', '.jpg')
    output_path = os.path.join(output_dir, output_filename)

    try:
        # Abrir imagen HEIC
        img = Image.open(input_path)

        # Obtener EXIF data
        exif = img.getexif()

        # Convertir y guardar como JPG con EXIF preservado
        img.save(output_path, "JPEG", quality=95, exif=exif)

        print(f"OK {filename} -> {output_filename}")
        converted += 1

    except Exception as e:
        print(f"ERROR {filename}: {e}")

print(f"\nConversion completa: {converted}/{len(heic_files)} archivos convertidos")
print(f"Archivos guardados en: {output_dir}")
