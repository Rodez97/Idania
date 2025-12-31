import json
import time
from geopy.geocoders import Nominatim

# Inicializar geocoder
geolocator = Nominatim(user_agent="idania-photos-app")

# Leer metadata
metadata_path = r"D:\Personal\Idania\idania-astro\public\images\metadata.json"
with open(metadata_path, 'r', encoding='utf-8') as f:
    photos = json.load(f)

print(f"Procesando {len(photos)} fotos...\n")

updated = 0
for photo in photos:
    if photo.get('location') and photo['location'].get('lat') and photo['location'].get('lon'):
        lat = photo['location']['lat']
        lon = photo['location']['lon']

        try:
            # Reverse geocoding
            location = geolocator.reverse(f"{lat}, {lon}", language='es', timeout=10)

            if location and location.raw.get('address'):
                address = location.raw['address']

                # Extraer ciudad/pueblo
                city = (
                    address.get('city') or
                    address.get('town') or
                    address.get('village') or
                    address.get('municipality') or
                    address.get('suburb')
                )

                # Extraer país
                country = address.get('country', '')

                # Crear nombre de ubicación
                if city:
                    if country == 'España' or country == 'Spain':
                        location_name = f"{city}, España"
                    elif country == 'Bélgica' or country == 'Belgium' or country == 'België':
                        location_name = f"{city}, Bélgica"
                    else:
                        location_name = f"{city}, {country}"
                else:
                    location_name = country

                # Actualizar
                old_name = photo.get('location_name', 'Sin ubicación')
                photo['location_name'] = location_name

                print(f"{photo['filename']}")
                print(f"  Antes: {old_name}")
                print(f"  Ahora: {location_name}")

                updated += 1

            # Respetar límite de rate (1 request/sec para Nominatim)
            time.sleep(1)

        except Exception as e:
            print(f"Error en {photo['filename']}: {e}")

# Guardar metadata actualizada
with open(metadata_path, 'w', encoding='utf-8') as f:
    json.dump(photos, f, indent=2, ensure_ascii=False)

print(f"\nCompletado! {updated} ubicaciones actualizadas")
print(f"Guardado en: {metadata_path}")
