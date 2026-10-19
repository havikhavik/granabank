// Los montos llegan como string ("125.00"). Se convierten a número solo para
// mostrarlos: no se hacen cuentas con ellos, así que no hay pérdida de precisión.
// Se usa el formato del diseño: punto decimal y separador de miles con coma.

const integerFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const decimalFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// "125.00" → "$125" · "95.50" → "$95.50" (como en el diseño, sin ",00")
export function formatAmount(amount: string) {
  const value = Number(amount);
  return `$${(Number.isInteger(value) ? integerFormat : decimalFormat).format(value)}`;
}

// "978.85" → "978.85" · "1000.00" → "1,000.00"
export function formatBalance(balance: string) {
  return decimalFormat.format(Number(balance));
}

// 2 y 2030 → "02/30"
export function formatExpiration(month: number, year: number) {
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

// La fecha se formatea en el servidor (que en producción corre en UTC), así que
// se fija la zona horaria para mostrar la hora de Argentina.
const dateTimeFormat = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
  timeStyle: "short",
  hourCycle: "h23", // 14:30 en vez de 2:30 p. m.
  timeZone: "America/Argentina/Buenos_Aires",
});

// "2026-10-19T17:30:00.000Z" → "19 de octubre de 2026 a las 14:30"
export function formatDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso));
}
