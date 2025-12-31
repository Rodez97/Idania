import os
import json
from PIL import Image
from PIL.ExifTags import IFD
from pillow_heif import register_heif_opener
from datetime import datetime

register_heif_opener()

photos_dir = r"D:\Personal\Idania\Photos-1-001"

def convert_to_degrees(value):
    """Convierte coordenadas GPS de grados/minutos/segundos a decimal"""
    if isinstance(value, (tuple, list)) and len(value) == 3:
        d, m, s = value
        return float(d) + (float(m) / 60.0) + (float(s) / 3600.0)
    return None

def get_city_from_coords(lat, lon):
    """Determina la ciudad específica basada en coordenadas GPS"""

    # Barcelona área (41.3-41.6, 2.0-2.5)
    if 41.3 <= lat <= 41.6 and 2.0 <= lon <= 2.5:
        # Más específico dentro de Barcelona
        if 41.38 <= lat <= 41.43 and 2.15 <= lon <= 2.20:
            return "Barcelona Centro"
        elif 41.47 <= lat <= 41.55 and 2.40 <= lon <= 2.47:
            return "Granollers, Barcelona"
        elif 41.52 <= lat <= 41.55 and 2.42 <= lon <= 2.45:
            return "Granollers, Barcelona"
        else:
            return "Barcelona, España"

    # Madrid (40.3-40.5, -3.8 a -3.6)
    elif 40.3 <= lat <= 40.5 and -3.8 <= lon <= -3.6:
        return "Madrid, España"

    # Bruselas área (50.8-50.9, 4.3-4.4)
    elif 50.8 <= lat <= 50.9 and 4.3 <= lon <= 4.5:
        return "Bruselas, Bélgica"

    # Brujas (51.2, 3.2)
    elif 51.15 <= lat <= 51.25 and 3.15 <= lon <= 3.25:
        return "Brujas, Bélgica"

    # Gante (51.0-51.1, 3.7-3.8)
    elif 51.0 <= lat <= 51.1 and 3.7 <= lon <= 3.8:
        return "Gante, Bélgica"

    # Amberes (51.2, 4.4)
    elif 51.15 <= lat <= 51.25 and 4.35 <= lon <= 4.45:
        return "Amberes, Bélgica"

    # Lovaina (50.87, 4.7)
    elif 50.85 <= lat <= 50.90 and 4.68 <= lon <= 4.72:
        return "Lovaina, Bélgica"

    # Bélgica genérico
    elif 49.5 <= lat <= 51.5 and 2.5 <= lon <= 6.4:
        return "Bélgica"

    # España genérico
    elif 36 <= lat <= 43.8 and -9.3 <= lon <= 3.3:
        return "España"

    return f"{lat:.4f}, {lon:.4f}"

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
            # Fecha - probar múltiples tags
            date_tags = [36867, 36868, 306]  # DateTimeOriginal, DateTimeDigitized, DateTime
            for tag in date_tags:
                if tag in exif_data and not metadata['date']:
                    try:
                        date_str = str(exif_data[tag])
                        # Intentar parsear la fecha
                        if ':' in date_str and ' ' in date_str:
                            date_obj = datetime.strptime(date_str, '%Y:%m:%d %H:%M:%S')
                            metadata['date'] = date_obj.strftime('%d/%m/%Y %H:%M')
                    except Exception as e:
                        print(f"  Error parseando fecha: {e}")

            # Cámara
            if 272 in exif_data:  # Model
                metadata['camera'] = str(exif_data[272])
            elif 271 in exif_data:  # Make
                metadata['camera'] = str(exif_data[271])

            # GPS usando get_ifd
            try:
                gps_ifd = exif_data.get_ifd(IFD.GPSInfo)
                if gps_ifd:
                    gps_latitude = gps_ifd.get(2)
                    gps_latitude_ref = gps_ifd.get(1, 'N')
                    gps_longitude = gps_ifd.get(4)
                    gps_longitude_ref = gps_ifd.get(3, 'E')

                    if gps_latitude and gps_longitude:
                        lat = convert_to_degrees(gps_latitude)
                        lon = convert_to_degrees(gps_longitude)

                        if lat and lon:
                            if gps_latitude_ref == 'S':
                                lat = -lat
                            if gps_longitude_ref == 'W':
                                lon = -lon

                            metadata['location'] = {
                                'lat': round(lat, 6),
                                'lon': round(lon, 6)
                            }
                            metadata['location_name'] = get_city_from_coords(lat, lon)
            except Exception as e:
                print(f"  Error GPS: {e}")

        return metadata
    except Exception as e:
        print(f"Error procesando {image_path}: {e}")
        return None

# Extraer de HEIC
heic_files = [f for f in os.listdir(photos_dir) if f.lower().endswith('.heic')]
print(f"Procesando {len(heic_files)} archivos HEIC...\n")

all_metadata = []
for filename in sorted(heic_files):
    filepath = os.path.join(photos_dir, filename)
    print(f"{filename}...")
    metadata = extract_metadata(filepath)
    if metadata:
        all_metadata.append(metadata)
        info = []
        if metadata['location_name']:
            info.append(f"GPS: {metadata['location_name']}")
        if metadata['date']:
            info.append(f"Fecha: {metadata['date']}")
        if info:
            print(f"  {' | '.join(info)}")

# Extraer de PNG
png_files = [f for f in os.listdir(photos_dir) if f.lower().endswith('.png')]
print(f"\nProcesando {len(png_files)} archivos PNG...\n")

for filename in sorted(png_files):
    filepath = os.path.join(photos_dir, filename)
    print(f"{filename}...")
    metadata = extract_metadata(filepath)
    if metadata:
        metadata['filename'] = filename
        metadata['original_filename'] = filename
        all_metadata.append(metadata)
        if metadata['date']:
            print(f"  Fecha: {metadata['date']}")

# Ordenar por filename
all_metadata.sort(key=lambda x: x['filename'])

# Guardar
output_file = os.path.join(photos_dir, 'metadata.json')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(all_metadata, f, indent=2, ensure_ascii=False)

# Resumen
images_with_date = sum(1 for m in all_metadata if m['date'])
images_with_location = sum(1 for m in all_metadata if m['location'])

print(f"\nCompleto! {len(all_metadata)} imagenes procesadas")
print(f"- Con fecha: {images_with_date}")
print(f"- Con GPS: {images_with_location}")
print(f"\nGuardado en: {output_file}")
