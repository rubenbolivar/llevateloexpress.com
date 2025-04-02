#!/usr/bin/env python3

"""
Script para corregir las referencias en dashboard/services.py
"""

import os
import re

# Archivo a procesar
file_path = 'dashboard/services.py'

# Patrones de reemplazo (expresión regular, reemplazo)
replacements = [
    # Reemplazar PaymentTransaction por Payment
    (r'PaymentTransaction\.objects', 'Payment.objects'),
    
    # Reemplazar PointsTransaction por PointTransaction
    (r'PointsTransaction\.objects', 'PointTransaction.objects'),
    
    # Reemplazar ClientPoints por UserPointsSummary
    (r'ClientPoints\.objects', 'UserPointsSummary.objects'),
]

def process_file():
    """Procesa el archivo aplicando todos los reemplazos necesarios"""
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
    print("🔍 Iniciando corrección del dashboard...")
    
    if process_file():
        print("✅ Correcciones aplicadas con éxito")
    else:
        print("ℹ️ No se encontraron problemas para corregir")

if __name__ == "__main__":
    main() 