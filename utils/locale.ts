// Utilities for locale-aware formatting across the app

export function formatNumber(value: number | string, isRTL: boolean): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return localizeDigitsInString(String(value), isRTL);
  // ثبات عبر كل المتصفحات: ننسق أولاً بأرقام لاتينية ثم نستبدل إلى عربية عند RTL
  const formatted = num.toLocaleString('en-US');
  return isRTL ? localizeDigitsInString(formatted, true) : formatted;
}

export function formatPercent(value0to100: number, isRTL: boolean): string {
  return `${formatNumber(Math.round(value0to100), isRTL)}%`;
}

export function formatTimeMMSS(totalSeconds: number, isRTL: boolean): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minutesText = formatNumber(minutes, isRTL);
  // Ensure we keep a two-digit seconds display with locale digits
  const secondsTextRaw = seconds.toString().padStart(2, '0');
  const secondsText = localizeDigitsInString(secondsTextRaw, isRTL);
  return `${minutesText}:${secondsText}`;
}

export function formatFraction(numerator: number, denominator: number, isRTL: boolean): string {
  return `${formatNumber(numerator, isRTL)}/${formatNumber(denominator, isRTL)}`;
}

export function formatLevelProgress(current: number, max: number, isRTL: boolean): string {
  return `${formatNumber(current, isRTL)}/${formatNumber(max, isRTL)}`;
}

// Replace ASCII digits in an arbitrary string with Arabic-Indic when isRTL
export function localizeDigitsInString(input: string, isRTL: boolean): string {
  if (!isRTL) return input;
  const arabicIndicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return input.replace(/[0-9]/g, (d) => arabicIndicDigits[Number(d)]);
}

