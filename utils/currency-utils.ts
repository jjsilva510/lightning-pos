import { AvailableCurrencies } from '@/types/config'; // Adjust path if needed, but '@/types/config' should still work if @ maps to project root

// Función para obtener el símbolo de la moneda cuando pagado
export const getCurrencySymbolForPay = (currencyCode: AvailableCurrencies): string => {
  switch (currencyCode) {
    case 'SAT':
      return '₿';
    default:
      return '$';
  }
};

// Función para obtener el nombre completo de la moneda
export const getCurrencySymbol = (currencyCode: AvailableCurrencies): string => {
  switch (currencyCode) {
    case 'SAT':
      return '₿';
    case 'USD':
    case 'ARS':
      return '$';
    case 'EUR':
      return '€';
    default:
      return '$';
  }
};