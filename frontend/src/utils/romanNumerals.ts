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

/**
 * Formats dusun name input to Roman numeral format
 * Handles "3" -> "III"
 * Handles "3B" -> "III-B"
 * Handles "3 B" -> "III-B"
 * Returns original string if no number found at start
 */
export function formatDusunName(input: string): string {
  if (!input) return "";
  
  // Match number at start, optional space, then letters
  const match = input.match(/^(\d+)\s*([a-zA-Z]*)$/);
  
  if (match) {
    const num = parseInt(match[1]);
    const suffix = match[2];
    
    if (num > 0 && num <= 100) {
      const roman = toRomanNumeral(num);
      return suffix ? `${roman}-${suffix.toUpperCase()}` : roman;
    }
  }
  
  return input;
}
