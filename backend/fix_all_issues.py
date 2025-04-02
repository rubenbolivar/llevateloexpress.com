#!/usr/bin/env python3

"""
Script para corregir todos los problemas de nombres y referencias en el sistema.
Este script realiza múltiples reemplazos en varios archivos para asegurar la consistencia.
"""

import os
import re
import sys

# Archivos a procesar
files_to_process = [
    'points_system/views.py',
    'points_system/services.py',
    'dashboard/services.py',
    'applications/views.py',  # Por si acaso
    'payments/views.py',      # Por si acaso
]

# Patrones de reemplazo globales
global_replacements = [
    # Modelos
    (r'\bClientPoints\b', 'UserPointsSummary'),
    (r'\bPointsTransaction\b', 'PointTransaction'),
    (r'\bPaymentTransaction\b', 'Payment'),
    
    # Serializers
    (r'\bClientPointsSerializer\b', 'UserPointsSummarySerializer'),
    (r'\bPointsTransactionSerializer\b', 'PointTransactionSerializer'),
    (r'\bPointsConfigurationSerializer\b', 'PointsConfigSerializer'),
    (r'\bEducationalPointsSerializer\b', 'EducationalCoursePointsSerializer'),
    (r'\bPointsAdjustmentSerializer\b', 'ManualPointsAdjustmentSerializer'),
    
    # Métodos y campos
    (r'client_points=([^,\)]+)', r'user=\1.user'),
    (r'\.points\b', '.current_points'),
    (r'applications_count=Count\(\'applications\'\)', 'applications_count=Count(\'credit_applications\')'),
    (r'Count\(\'applications\', distinct=True\)', 'Count(\'credit_applications\', distinct=True)'),
    (r'Count\(\'products__applications\', distinct=True\)', 'Count(\'products__credit_applications\', distinct=True)'),
    (r'transaction_date', 'payment_date'),
]

# Patrones específicos para cada archivo
file_specific_replacements = {
    'dashboard/services.py': [
        (r'points_summary\.filter\(points__gte=', 'points_summary.filter(current_points__gte='),
        (r'applications_count=Count\(\'applications\'\)', 'applications_count=Count(\'credit_applications\')'),
    ]
}

def process_file(file_path, replacements):
    """Procesa un archivo aplicando los reemplazos necesarios"""
    if not os.path.exists(file_path):
        print(f"⚠️ El archivo {file_path} no existe")
        return False
    
    try:
        # Leer el contenido del archivo
        with open(file_path, 'r') as file:
            content = file.read()
        
        # Aplicar todos los reemplazos globales
        modified_content = content
        for pattern, replacement in replacements:
            modified_content = re.sub(pattern, replacement, modified_content)
        
        # Aplicar reemplazos específicos si existen para este archivo
        if file_path in file_specific_replacements:
            for pattern, replacement in file_specific_replacements[file_path]:
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
    except Exception as e:
        print(f"❌ Error al procesar {file_path}: {str(e)}")
        return False

def main():
    """Función principal"""
    print("🔍 Iniciando corrección completa del sistema...")
    
    changes_made = 0
    for file_path in files_to_process:
        if process_file(file_path, global_replacements):
            changes_made += 1
    
    if changes_made > 0:
        print(f"✅ Correcciones aplicadas con éxito en {changes_made} archivos")
    else:
        print("ℹ️ No se encontraron problemas para corregir")

if __name__ == "__main__":
    main() 