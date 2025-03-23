'use client';

import { formatCurrency } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number | string | null | undefined;
  symbol?: string;
  className?: string;
}

/**
 * Component to display currency amounts in Venezuelan dollar format (e.g., $42.000,00)
 */
export default function CurrencyDisplay({
  amount,
  symbol = "$",
  className = ""
}: CurrencyDisplayProps) {
  const formattedAmount = formatCurrency(amount, symbol);
  
  return (
    <span className={className}>
      {formattedAmount}
    </span>
  );
} 