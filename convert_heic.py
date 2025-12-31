import os
from PIL import Image
from pillow_heif import register_heif_opener

# Registrar el opener de HEIF para que PIL pueda abrir archivos HEIC
register_heif_opener()

# Directorio con las fotos
photos_dir = r"D:\Personal\Idania\Photos-1-001"

# Obtener todos los archivos HEIC
heic_files = [f for f in os.listdir(photos_dir) if f.upper().endswith('.HEIC')]

print(f"Encontradas {len(heic_files)} imágenes HEIC para convertir")

# Convertir cada archivo HEIC a JPG
for heic_file in heic_files:
    input_path = os.path.join(photos_dir, heic_file)
    output_file = heic_file.rsplit('.', 1)[0] + '.jpg'
    output_path = os.path.join(photos_dir, output_file)

    try:
        print(f"Convirtiendo {heic_file}...", end=' ')
        # Abrir la imagen HEIC
        img = Image.open(input_path)

        # Convertir a RGB si es necesario (HEIC puede tener diferentes modos)
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Guardar como JPG con buena calidad
        img.save(output_path, 'JPEG', quality=95)
        print("OK - Convertida exitosamente")
    except Exception as e:
        print(f"ERROR: {e}")

print("\nConversión completada!")
