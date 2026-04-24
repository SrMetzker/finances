export type SupportedCurrency = 'EUR' | 'USD' | 'BRL' | 'GBP';

export function formatCurrency(
  value: number,
  currency: SupportedCurrency = 'EUR',
) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}
