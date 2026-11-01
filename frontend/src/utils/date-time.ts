/** Formatação consistente no fuso de Brasília, independente do host e do navegador. */
export const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';

function parseApiDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    // Mantém datas sem horário no mesmo dia do calendário brasileiro.
    return new Date(`${trimmed}T15:00:00.000Z`);
  }
  const normalized = trimmed.includes(' ') && !trimmed.includes('T')
    ? trimmed.replace(' ', 'T')
    : trimmed;
  const hasExplicitZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
  // O backend grava timestamps sem offset em DATETIME, seguindo a convenção UTC.
  return new Date(hasExplicitZone ? normalized : `${normalized}Z`);
}

export function parseBrasiliaDate(value: string | Date): Date {
  return parseApiDate(value);
}

export function formatBrasiliaDateTime(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }
): string {
  return parseApiDate(value).toLocaleString('pt-BR', { ...options, timeZone: BRASILIA_TIME_ZONE });
}

export function formatBrasiliaTime(
  value: string | Date = new Date(),
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
): string {
  return parseApiDate(value).toLocaleTimeString('pt-BR', { ...options, timeZone: BRASILIA_TIME_ZONE });
}
