#!/usr/bin/env python3

"""
Script para corregir el problema de importación en points_system/views.py
Reemplaza todas las referencias a ClientPoints por UserPointsSummary
"""

import os

# Ruta al archivo views.py
views_path = 'points_system/views.py'

# Leer el contenido del archivo
with open(views_path, 'r') as file:
    content = file.read()

# Reemplazar todas las ocurrencias de ClientPoints por UserPointsSummary
content = content.replace('ClientPoints', 'UserPointsSummary')
content = content.replace('ClientPointsSerializer', 'UserPointsSummarySerializer')
content = content.replace('ClientPointsViewSet', 'UserPointsSummaryViewSet')

# Guardar el archivo modificado
with open(views_path, 'w') as file:
    file.write(content)

print(f"✅ Archivo {views_path} actualizado correctamente") 