// src/lib/utils/helpers.ts
export const formatCurrency = (amount: number, currency: string = 'GEL') => {
  const locale = 'en-US'; // Or your desired locale for currency formatting
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  // Handle specific currency symbol if needed (e.g., '₾' for GEL)
  if (currency === 'GEL') {
    return new Intl.NumberFormat(locale, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' ₾';
  }

  return new Intl.NumberFormat(locale, options).format(amount);
};

export const formatDate = (dateString: string | Date, includeTime: boolean = false): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};