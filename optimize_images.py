import os
from PIL import Image

# Directorios
source_dir = r"D:\Personal\Idania\idania-astro\public\images"
output_dir = source_dir  # Sobrescribir las mismas imágenes

# Tamaño máximo para el lado más largo
MAX_SIZE = 1200
QUALITY = 85

# Obtener todas las imágenes
image_files = [f for f in os.listdir(source_dir)
               if f.lower().endswith(('.jpg', '.jpeg', '.png')) and f != 'metadata.json']

print(f"Optimizando {len(image_files)} imagenes...\n")

total_before = 0
total_after = 0
optimized_count = 0

for filename in image_files:
    filepath = os.path.join(source_dir, filename)

    # Tamaño original
    size_before = os.path.getsize(filepath) / (1024 * 1024)  # MB
    total_before += size_before

    try:
        img = Image.open(filepath)
        original_size = img.size

        # Calcular nuevo tamaño manteniendo aspect ratio
        width, height = img.size
        if width > MAX_SIZE or height > MAX_SIZE:
            if width > height:
                new_width = MAX_SIZE
                new_height = int(height * (MAX_SIZE / width))
            else:
                new_height = MAX_SIZE
                new_width = int(width * (MAX_SIZE / height))

            # Redimensionar
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            resized = True
        else:
            resized = False

        # Convertir PNG a RGB si es necesario (para JPG)
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background

        # Guardar optimizado
        if filename.lower().endswith('.png'):
            # Convertir PNG a JPG para mejor compresión
            new_filename = filename.replace('.PNG', '.jpg').replace('.png', '.jpg')
            output_path = os.path.join(output_dir, new_filename)
            img.save(output_path, 'JPEG', quality=QUALITY, optimize=True)

            # Eliminar PNG original si se creó JPG
            if new_filename != filename:
                os.remove(filepath)
        else:
            # Sobrescribir JPG
            img.save(filepath, 'JPEG', quality=QUALITY, optimize=True)

        # Tamaño después
        final_path = os.path.join(output_dir, filename.replace('.PNG', '.jpg').replace('.png', '.jpg'))
        size_after = os.path.getsize(final_path) / (1024 * 1024)  # MB
        total_after += size_after

        reduction = ((size_before - size_after) / size_before * 100) if size_before > 0 else 0

        status = "REDIMENSIONADA" if resized else "COMPRIMIDA"
        print(f"{filename}")
        print(f"  {status}: {original_size[0]}x{original_size[1]} -> {img.size[0]}x{img.size[1]}")
        print(f"  Tamanio: {size_before:.2f}MB -> {size_after:.2f}MB (-{reduction:.1f}%)")

        optimized_count += 1

    except Exception as e:
        print(f"ERROR {filename}: {e}")

print(f"\nCompletado!")
print(f"Imagenes optimizadas: {optimized_count}/{len(image_files)}")
print(f"Tamanio total antes: {total_before:.2f}MB")
print(f"Tamanio total despues: {total_after:.2f}MB")
print(f"Ahorro total: {total_before - total_after:.2f}MB (-{((total_before - total_after) / total_before * 100):.1f}%)")
