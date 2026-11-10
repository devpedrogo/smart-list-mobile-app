export interface ShoppingItem {
  id: string;
  name: string;
  /** Campo livre: "2 un", "500g", "4 caixas" etc. */
  quantity: string;
  category: string;
  completed: boolean;
  completedAt?: string | null;
}
export interface ShoppingItemPayload {
  name: string;
  quantity: string;
  category: string;
}
export interface ShoppingItemGroups {
  pending: ShoppingItem[];
  completed: ShoppingItem[];
}
export interface CategoryDefinition {
  label: string;
  icon: string;
  tint: string;
  ink: string;
}
