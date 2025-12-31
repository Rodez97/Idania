from PIL import Image
from pillow_heif import register_heif_opener
import os

register_heif_opener()

# Analizar un archivo HEIC de ejemplo
photo_path = r"D:\Personal\Idania\Photos-1-001\IMG_6600.HEIC"

print(f"Analizando: {os.path.basename(photo_path)}\n")

img = Image.open(photo_path)

# Método 1: getexif()
print("=== EXIF con getexif() ===")
exif = img.getexif()
if exif:
    for tag, value in exif.items():
        print(f"Tag {tag}: {type(value).__name__} = {str(value)[:100]}")
else:
    print("Sin datos EXIF con getexif()")

print("\n=== EXIF con _getexif() ===")
# Método 2: _getexif() (método privado pero a veces funciona mejor)
try:
    exif2 = img._getexif()
    if exif2:
        for tag, value in exif2.items():
            print(f"Tag {tag}: {type(value).__name__} = {str(value)[:100]}")
    else:
        print("Sin datos EXIF con _getexif()")
except:
    print("_getexif() no disponible")

# Buscar específicamente GPS
print("\n=== Búsqueda específica de GPS ===")
if 34853 in exif:
    print(f"GPS Info encontrado en tag 34853:")
    print(f"Tipo: {type(exif[34853])}")
    print(f"Contenido: {exif[34853]}")
else:
    print("No se encontró tag 34853 (GPSInfo)")

# Probar get_ifd()
print("\n=== IFD GPS ===")
try:
    from PIL.ExifTags import IFD
    gps_ifd = exif.get_ifd(IFD.GPSInfo)
    if gps_ifd:
        print("GPS IFD encontrado:")
        for key, val in gps_ifd.items():
            print(f"  {key}: {val}")
    else:
        print("Sin GPS IFD")
except Exception as e:
    print(f"Error obteniendo GPS IFD: {e}")
