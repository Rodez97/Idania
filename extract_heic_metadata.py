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
    """Convierte coordenadas GPS de grados/minutos/segundos a decimal"""
    if isinstance(value, (tuple, list)) and len(value) == 3:
        d, m, s = value
        return float(d) + (float(m) / 60.0) + (float(s) / 3600.0)
    return None

# Función para obtener nombre de lugar desde coordenadas (simplificado)
def get_location_name(lat, lon):
    """Determina el nombre del lugar basado en coordenadas"""
    # Bélgica aproximadamente: lat 49-51.5, lon 2.5-6.4
    if 49 <= lat <= 51.5 and 2.5 <= lon <= 6.4:
        return "Bélgica"
    # Madrid aproximadamente: lat 40.3-40.5, lon -3.8 a -3.6
    elif 40.3 <= lat <= 40.5 and -3.8 <= lon <= -3.6:
        return "Madrid, España"
    # España en general
    elif 36 <= lat <= 43.8 and -9.3 <= lon <= 3.3:
        return "España"
    return f"Lat: {lat:.4f}, Lon: {lon:.4f}"

# Función para extraer metadatos EXIF de HEIC
def extract_metadata(image_path):
    try:
        img = Image.open(image_path)
        exif_data = img.getexif()

        metadata = {
            'filename': os.path.basename(image_path).replace('.HEIC', '.jpg').replace('.heic', '.jpg'),
            'original_filename': os.path.basename(image_path),
            'date': None,
            'location': None,
            'location_name': None,
            'camera': None,
            'width': img.width,
            'height': img.height
        }

        if exif_data:
            # Fecha original
            if 36867 in exif_data:  # DateTimeOriginal
                try:
                    date_str = exif_data[36867]
                    date_obj = datetime.strptime(str(date_str), '%Y:%m:%d %H:%M:%S')
                    metadata['date'] = date_obj.strftime('%d/%m/%Y %H:%M')
                except:
                    metadata['date'] = str(exif_data[36867])

            # Modelo de cámara
            if 272 in exif_data:  # Model
                metadata['camera'] = str(exif_data[272])
            elif 271 in exif_data:  # Make
                metadata['camera'] = str(exif_data[271])

            # GPS Info usando get_ifd
            try:
                from PIL.ExifTags import IFD
                gps_ifd = exif_data.get_ifd(IFD.GPSInfo)
                if gps_ifd:
                    # Latitud
                    gps_latitude = gps_ifd.get(2)
                    gps_latitude_ref = gps_ifd.get(1, 'N')

                    # Longitud
                    gps_longitude = gps_ifd.get(4)
                    gps_longitude_ref = gps_ifd.get(3, 'E')

                    if gps_latitude and gps_longitude:
                        lat = convert_to_degrees(gps_latitude)
                        lon = convert_to_degrees(gps_longitude)

                        if lat and lon:
                            # Aplicar referencias (N/S, E/W)
                            if gps_latitude_ref == 'S':
                                lat = -lat
                            if gps_longitude_ref == 'W':
                                lon = -lon

                            metadata['location'] = {
                                'lat': round(lat, 6),
                                'lon': round(lon, 6)
                            }
                            metadata['location_name'] = get_location_name(lat, lon)
            except Exception as e:
                print(f"  Error extrayendo GPS: {e}")

        return metadata
    except Exception as e:
        print(f"Error procesando {image_path}: {e}")
        return None

# Obtener todos los archivos HEIC
heic_files = [f for f in os.listdir(photos_dir) if f.lower().endswith('.heic')]

print(f"Encontrados {len(heic_files)} archivos HEIC")
print("Extrayendo metadatos...\n")

# Extraer metadatos de cada HEIC
all_metadata = []
for filename in sorted(heic_files):
    filepath = os.path.join(photos_dir, filename)
    print(f"Procesando {filename}...")
    metadata = extract_metadata(filepath)
    if metadata:
        all_metadata.append(metadata)
        if metadata['location']:
            print(f"  GPS: {metadata['location_name']}")
        if metadata['date']:
            print(f"  Fecha: {metadata['date']}")

# Ahora añadir los PNG (capturas) que no tienen GPS
png_files = [f for f in os.listdir(photos_dir) if f.lower().endswith('.png')]
for filename in sorted(png_files):
    filepath = os.path.join(photos_dir, filename)
    print(f"Procesando {filename}...")
    metadata = extract_metadata(filepath)
    if metadata:
        metadata['filename'] = filename  # Mantener .PNG
        metadata['original_filename'] = filename
        all_metadata.append(metadata)

# Ordenar por filename
all_metadata.sort(key=lambda x: x['filename'])

# Guardar metadatos en JSON
output_file = os.path.join(photos_dir, 'metadata.json')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(all_metadata, f, indent=2, ensure_ascii=False)

print(f"\nOK Metadatos extraidos! Total de imagenes: {len(all_metadata)}")
print(f"OK Archivo guardado en: {output_file}")

# Mostrar resumen
images_with_date = sum(1 for m in all_metadata if m['date'])
images_with_location = sum(1 for m in all_metadata if m['location'])
images_with_camera = sum(1 for m in all_metadata if m['camera'])

print(f"\nResumen:")
print(f"- Imágenes con fecha: {images_with_date}")
print(f"- Imágenes con ubicación GPS: {images_with_location}")
print(f"- Imágenes con info de cámara: {images_with_camera}")
