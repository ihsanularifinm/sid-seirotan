/**
 * Converts an integer to Roman numeral format
 * Supports numbers 1-100
 * Returns the number as string if out of range
 */
export function toRomanNumeral(num: number): string {
  if (num < 1 || num > 100) {
    return num.toString(); // Fallback for out of range
  }
  
  const values = [100, 90, 50, 40, 10, 9, 5, 4, 1];
  const numerals = ['C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  
  let result = '';
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += numerals[i];
      num -= values[i];
    }
  }
  
  return result;
}
