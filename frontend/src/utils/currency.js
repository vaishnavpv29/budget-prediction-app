// Format number as Indian Rupees
export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

// Short format for chart axes: ₹1.2L, ₹5Cr
export const formatINRShort = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(1) + 'Cr';
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
  if (amount >= 1000) return '₹' + (amount / 1000).toFixed(0) + 'K';
  return '₹' + amount;
};
