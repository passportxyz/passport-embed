// Format to integer
export const displayNumber = (num?: number): string => {
  if (!num) return "0";
  return String(Math.abs(num) < 1 ? num.toFixed(1) : parseInt(num.toString()));
};
