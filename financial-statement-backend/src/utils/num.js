// Normalize currency/number strings to JS numbers.
// Handles commas, spaces, currency symbols, and (1,234.56) negatives.
function toNumber(raw) {
  if (raw == null) return null;
  let s = String(raw).trim();

  // Parentheses for negatives
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }

  // Remove currency and spaces
  s = s.replace(/[$£€₨₹,\s]/g, '');

  // Fix locale variants: 1.234,56 -> 1234.56
  const commaCount = (s.match(/,/g) || []).length;
  const dotCount = (s.match(/\./g) || []).length;
  if (commaCount && dotCount) {
    // assume dot = thousand, comma = decimal
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (commaCount && !dotCount) {
    // assume comma = decimal
    s = s.replace(',', '.');
  }

  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return negative ? -Math.abs(n) : n;
}

module.exports = { toNumber };
