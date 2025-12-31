import json

# Leer el archivo metadata.json
with open(r'D:\Personal\Idania\Photos-1-001\metadata.json', 'r', encoding='utf-8') as f:
    metadata = json.load(f)

# Generar HTML para la galería
gallery_html = []

for photo in metadata:
    filename = photo['filename']
    date = photo.get('date')

    if date:
        item_html = f'''                <div class="gallery-item">
                    <img src="Photos-1-001/{filename}" alt="Idania" loading="lazy">
                    <div class="photo-overlay">
                        <div class="photo-date">
                            <i data-lucide="calendar"></i>
                            <span>{date}</span>
                        </div>
                    </div>
                </div>'''
    else:
        item_html = f'''                <div class="gallery-item">
                    <img src="Photos-1-001/{filename}" alt="Idania" loading="lazy">
                </div>'''

    gallery_html.append(item_html)

# Unir todo el HTML
full_gallery_html = '\n'.join(gallery_html)

print("HTML generado para la galería:")
print("\n" + "="*80 + "\n")
print(full_gallery_html)
print("\n" + "="*80 + "\n")

# Guardar en archivo
with open(r'D:\Personal\Idania\gallery_output.html', 'w', encoding='utf-8') as f:
    f.write(full_gallery_html)

print(f"\nTotal de fotos: {len(metadata)}")
print(f"HTML guardado en: D:\\Personal\\Idania\\gallery_output.html")
