import type { Residence } from '@/types/settings';
const toRad = (d: number) => d * Math.PI / 180;
/** Distância em metros, usada somente na inicialização do monitoramento. */
export function metersBetween(a: {latitude:number;longitude:number}, b: {latitude:number;longitude:number}): number {
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export function insideRadius(point: {latitude:number;longitude:number}, res: Residence): boolean {
  return metersBetween(point, res) <= res.radiusMeters;
}
