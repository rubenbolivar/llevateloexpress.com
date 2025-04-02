#!/usr/bin/env python3

"""
Script para corregir las referencias a ClientPoints en todo el sistema de puntos.
Este script reemplaza ClientPoints por UserPointsSummary y actualiza referencias relacionadas.

Es importante mantener la integridad del sistema de puntos ya que es crítico para el modelo de negocio.
"""

import os
import re

# Directorios y archivos a procesar
files_to_process = [
    'points_system/views.py',
    'points_system/services.py',
    'points_system/serializers.py',  # Por si acaso hay referencias aquí también
]

# Patrones de reemplazo (expresión regular, reemplazo)
replacements = [
    # Reemplazo general del nombre de la clase
    (r'\bClientPoints\b', 'UserPointsSummary'),
    
    # Reemplazo de nombres de serializadores
    (r'\bClientPointsSerializer\b', 'UserPointsSummarySerializer'),
    (r'\bClientPointsViewSet\b', 'UserPointsSummaryViewSet'),
    
    # Reemplazo de relaciones incorrectas
    (r'PointTransaction\.objects\.filter\(client_points=([^)]+)\)', r'PointTransaction.objects.filter(user=\1.user)'),
    
    # Reemplazo de campos en la creación de transacciones
    (r'client_points=([^,]+),', r'user=\1.user,'),
]

def process_file(file_path):
    """Procesa un archivo aplicando todos los reemplazos necesarios"""
    if not os.path.exists(file_path):
        print(f"⚠️ El archivo {file_path} no existe")
        return False
    
    # Leer el contenido del archivo
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Aplicar todos los reemplazos
    modified_content = content
    for pattern, replacement in replacements:
        modified_content = re.sub(pattern, replacement, modified_content)
    
    # Si no hubo cambios, no hacer nada
    if modified_content == content:
        print(f"ℹ️ No se encontraron cambios en {file_path}")
        return False
    
    # Guardar el archivo modificado
    with open(file_path, 'w') as file:
        file.write(modified_content)
    
    print(f"✅ Archivo {file_path} actualizado correctamente")
    return True

def main():
    """Función principal"""
    print("🔍 Iniciando corrección del sistema de puntos...")
    
    # Procesar cada archivo
    changes_made = False
    for file_path in files_to_process:
        if process_file(file_path):
            changes_made = True
    
    if changes_made:
        print("✅ Correcciones aplicadas con éxito")
    else:
        print("ℹ️ No se encontraron problemas para corregir")

if __name__ == "__main__":
    main() 