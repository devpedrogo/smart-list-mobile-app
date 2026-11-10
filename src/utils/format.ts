export function firstNames(names: string[], limit = 3): string {
  const cut = names.slice(0, limit).join(', ');
  return names.length > limit ? `${cut} e mais ${names.length - limit}` : cut;
}
export function plural(count: number, singular: string, multiple: string): string {
  return `${count} ${count === 1 ? singular : multiple}`;
}
export function untilTomorrowMorning(now = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  d.setHours(8, 0, 0, 0);
  return d;
}
export function cleanError(value: unknown): string {
  return value instanceof Error ? value.message : 'Não foi possível concluir a operação.';
}
