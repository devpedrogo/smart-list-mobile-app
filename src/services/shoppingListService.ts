import { api } from '@/api/client';
import { categoryToApi, mapShoppingGroups } from '@/api/adapters';
import type { ShoppingItemGroups, ShoppingItemPayload } from '@/types/shopping';
export const shoppingListService = {
  async getAll(): Promise<ShoppingItemGroups> {
    const { data } = await api.get<unknown>('/shopping-items');
    return mapShoppingGroups(data);
  },
  async add(payload: ShoppingItemPayload): Promise<void> {
    await api.post('/shopping-items', { ...payload, category: categoryToApi(payload.category) });
  },
  async update(id: string, payload: ShoppingItemPayload): Promise<void> {
    await api.put(`/shopping-items/${encodeURIComponent(id)}`, { ...payload, category: categoryToApi(payload.category) });
  },
  async toggle(id: string): Promise<void> {
    await api.patch(`/shopping-items/${encodeURIComponent(id)}/toggle`);
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/shopping-items/${encodeURIComponent(id)}`);
  },
  async clearCompleted(): Promise<void> {
    await api.delete('/shopping-items/completed');
  },
};
