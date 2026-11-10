import type { CategoryDefinition } from '@/types/shopping';
export const CATEGORIES: CategoryDefinition[] = [
  { label: 'Padaria', icon: 'basket-outline', tint: '#F4E9D7', ink: '#965300' },
  { label: 'Farmácia', icon: 'medkit-outline', tint: '#E8F5FA', ink: '#2674A0' },
  { label: 'Mercado', icon: 'cart-outline', tint: '#E2F5EA', ink: '#197E45' },
  { label: 'Mercearia', icon: 'basket-outline', tint: '#F4E9D7', ink: '#965300' },
  { label: 'Óleos e condimentos', icon: 'flask-outline', tint: '#FFF0D8', ink: '#94620B' },
  { label: 'Limpeza', icon: 'water-outline', tint: '#E9F2FF', ink: '#3574B8' },
  { label: 'Higiene pessoal', icon: 'person-outline', tint: '#F3EAFE', ink: '#7355BA' },
  { label: 'Papelaria', icon: 'pencil-outline', tint: '#F0EAFE', ink: '#7355BA' },
  { label: 'Hortifrúti', icon: 'leaf-outline', tint: '#E3F9D9', ink: '#367B27' },
  { label: 'Laticínios', icon: 'cafe-outline', tint: '#E5F0FF', ink: '#5376A7' },
  { label: 'Outros', icon: 'pricetag-outline', tint: '#EEF0F5', ink: '#5C677C' },
];
export const UNIT_SHORTCUTS = ['un', 'kg', 'g', 'pct', 'L', 'cx'] as const;
export function getCategory(name: string): CategoryDefinition {
  return CATEGORIES.find(c => c.label.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))
    ?? CATEGORIES[CATEGORIES.length - 1]!;
}
