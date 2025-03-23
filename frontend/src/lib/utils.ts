/**
 * Utility functions for the LlévateloExpress frontend
 */

/**
 * Format a currency amount according to Venezuela's dollar format standards.
 * Using dot as thousand separator and comma as decimal separator.
 * 
 * Example: $42.000,00
 * 
 * @param amount The amount to format
 * @param symbol The currency symbol, defaults to "$"
 * @returns A formatted currency string
 */
export const formatCurrency = (amount: number | string | null | undefined, symbol: string = "$"): string => {
  if (amount === null || amount === undefined) {
    return `${symbol}0,00`;
  }

  // Convert to number if it's a string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN
  if (isNaN(numericAmount)) {
    return `${symbol}0,00`;
  }

  // Format to 2 decimal places and get the parts
  const parts = numericAmount.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Add thousand separators (dots)
  const integerWithSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Return formatted string with comma as decimal separator
  return `${symbol}${integerWithSeparators},${decimalPart}`;
};

/**
 * Parse a currency string in Venezuelan dollar format back to a number
 * 
 * @param formattedAmount The formatted amount string (e.g., "$42.000,00")
 * @returns The parsed number value
 */
export const parseCurrency = (formattedAmount: string): number => {
  if (!formattedAmount) return 0;

  // Remove currency symbol and thousand separators, replace decimal comma with dot
  const cleanString = formattedAmount
    .replace(/[^\d,.-]/g, '') // Remove any character that is not digit, comma, dot or negative sign
    .replace(/\./g, '')       // Remove dots (thousand separators)
    .replace(',', '.');       // Replace comma with dot for decimal

  return parseFloat(cleanString);
};

/**
 * Format a date string to local format (DD/MM/YYYY)
 * 
 * @param dateString The date string to format (ISO format or any format accepted by Date constructor)
 * @param includeTime Whether to include time in the formatted result
 * @returns A formatted date string
 */
export const formatDate = (dateString: string | null | undefined, includeTime = false): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    // Format date in Spanish format (DD/MM/YYYY)
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    let formattedDate = `${day}/${month}/${year}`;
    
    // Include time if requested
    if (includeTime) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      formattedDate += ` ${hours}:${minutes}`;
    }
    
    return formattedDate;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error de formato';
  }
}; 