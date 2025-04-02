#!/usr/bin/env python3

"""
Script para corregir las referencias a client_points en points_system/views.py
"""

import os
import re

# Ruta al archivo views.py
views_path = 'points_system/views.py'

# Leer el contenido del archivo
with open(views_path, 'r') as file:
    content = file.read()

# Patrón para encontrar la expresión incorrecta
pattern = r"PointTransaction\.objects\.filter\(client_points=points_profile\)"

# Reemplazar con la expresión correcta (filtrar por usuario)
replacement = "PointTransaction.objects.filter(user=points_profile.user)"

# Aplicar el reemplazo
modified_content = re.sub(pattern, replacement, content)

# Guardar el archivo modificado
with open(views_path, 'w') as file:
    file.write(modified_content)

print(f"✅ Archivo {views_path} actualizado correctamente con los filtros corregidos") 