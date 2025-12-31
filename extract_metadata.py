import os
import json
from PIL import Image
from pillow_heif import register_heif_opener
from datetime import datetime

# Registrar el opener de HEIF
register_heif_opener()

# Directorio con las fotos
photos_dir = r"D:\Personal\Idania\Photos-1-001"

# Función para convertir coordenadas GPS a decimal
def convert_to_degrees(value):
    d, m, s = value
    return d + (m / 60.0) + (s / 3600.0)

# Función para extraer metadatos EXIF
def extract_metadata(image_path):
    try:
        img = Image.open(image_path)
        exif_data = img._getexif()

        metadata = {
            'filename': os.path.basename(image_path),
            'date': None,
            'location': None,
            'camera': None,
            'width': img.width,
            'height': img.height
        }

        if exif_data:
            # Códigos EXIF comunes
            EXIF_TAGS = {
                36867: 'DateTimeOriginal',  # Fecha original
                36868: 'DateTimeDigitized',  # Fecha digitalizada
                272: 'Model',  # Modelo de cámara
                271: 'Make',  # Fabricante de cámara
                34853: 'GPSInfo'  # Info GPS
            }

            for tag, value in exif_data.items():
                tag_name = EXIF_TAGS.get(tag, tag)

                # Fecha
                if tag_name in ['DateTimeOriginal', 'DateTimeDigitized'] and not metadata['date']:
                    try:
                        date_obj = datetime.strptime(str(value), '%Y:%m:%d %H:%M:%S')
                        metadata['date'] = date_obj.strftime('%d/%m/%Y %H:%M')
                    except:
                        metadata['date'] = str(value)

                # Cámara
                if tag_name == 'Model':
                    metadata['camera'] = str(value)
                elif tag_name == 'Make' and not metadata['camera']:
                    metadata['camera'] = str(value)

                # GPS
                if tag_name == 'GPSInfo' and isinstance(value, dict):
                    try:
                        gps_latitude = value.get(2)
                        gps_latitude_ref = value.get(1)
                        gps_longitude = value.get(4)
                        gps_longitude_ref = value.get(3)

                        if gps_latitude and gps_longitude:
                            lat = convert_to_degrees(gps_latitude)
                            if gps_latitude_ref == 'S':
                                lat = -lat

                            lon = convert_to_degrees(gps_longitude)
                            if gps_longitude_ref == 'W':
                                lon = -lon

                            metadata['location'] = {
                                'lat': lat,
                                'lon': lon
                            }
                    except:
                        pass

        return metadata
    except Exception as e:
        print(f"Error procesando {image_path}: {e}")
        return None

# Obtener todos los archivos de imagen
image_files = [f for f in os.listdir(photos_dir)
               if f.lower().endswith(('.jpg', '.jpeg', '.png', '.heic'))]

# Extraer metadatos de cada imagen
all_metadata = []
for filename in sorted(image_files):
    filepath = os.path.join(photos_dir, filename)
    print(f"Procesando {filename}...")
    metadata = extract_metadata(filepath)
    if metadata:
        all_metadata.append(metadata)

# Guardar metadatos en JSON
output_file = os.path.join(photos_dir, 'metadata.json')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(all_metadata, f, indent=2, ensure_ascii=False)

print(f"\n¡Metadatos extraídos! Total de imágenes: {len(all_metadata)}")
print(f"Archivo guardado en: {output_file}")

# Mostrar resumen
images_with_date = sum(1 for m in all_metadata if m['date'])
images_with_location = sum(1 for m in all_metadata if m['location'])
images_with_camera = sum(1 for m in all_metadata if m['camera'])

print(f"\nResumen:")
print(f"- Imágenes con fecha: {images_with_date}")
print(f"- Imágenes con ubicación GPS: {images_with_location}")
print(f"- Imágenes con info de cámara: {images_with_camera}")
