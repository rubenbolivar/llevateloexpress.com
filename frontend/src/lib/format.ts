/**
 * Formatea un número como moneda en USD
 * @param amount - El monto a formatear
 * @returns String formateado como moneda
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Parsea un string con formato de moneda a número
 * @param value - String con formato de moneda
 * @returns Número sin formato
 */
export const parseCurrency = (value: string): number => {
  // Eliminar símbolos de moneda y separadores de miles
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned);
};

/**
 * Formatea un número como porcentaje
 * @param value - El valor a formatear (0.05 = 5%)
 * @returns String formateado como porcentaje
 */
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('es-VE', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formatea una fecha en formato corto
 * @param date - Fecha a formatear
 * @returns String con fecha formateada
 */
export const formatDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

/**
 * Formatea un número con separadores de miles
 * @param value - Número a formatear
 * @returns String con número formateado
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-VE').format(value);
};

/**
 * Formatea un número como moneda
 * @param value Valor numérico a formatear
 * @param currencySymbol Símbolo de moneda a utilizar
 * @returns Texto formateado como moneda
 */
export function formatCurrencyOld(value: number, currencySymbol = 'Bs.'): string {
  return `${currencySymbol} ${value.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formatea una fecha en formato local
 * @param date Fecha a formatear
 * @returns Texto con la fecha formateada
 */
export function formatDateOld(date: Date): string {
  return date.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Convierte un string a número
 * @param value Texto a convertir
 * @param defaultValue Valor por defecto si no es un número válido
 * @returns Valor numérico
 */
export function parseNumber(value: string, defaultValue = 0): number {
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? defaultValue : parsed;
} 